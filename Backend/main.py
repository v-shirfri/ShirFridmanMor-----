import json
import threading
from contextlib import asynccontextmanager
from typing import Optional
import logging
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import database
import openai_client

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.run_migrations()
    yield


_raw_origins = os.getenv(
    "ALLOW_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5175,http://127.0.0.1:5175,http://localhost:5174,http://127.0.0.1:5174",
)
ALLOW_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class MessageRequest(BaseModel):
    message: str
    effort: str = "standard"
    image: Optional[str] = None


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again."},
    )


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/conversations")
def list_conversations():
    return {"conversations": database.list_conversations()}


@app.post("/api/conversations", status_code=201)
def create_conversation():
    conversation_id = database.create_conversation()
    return {"conversation_id": conversation_id}


@app.get("/api/conversations/{conversation_id}/messages")
def get_conversation_messages(conversation_id: int):
    if not database.get_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return {"messages": database.get_messages(conversation_id)}


@app.post("/api/conversations/{conversation_id}/messages")
def send_message(conversation_id: int, request: MessageRequest):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    if len(request.message.strip()) > 4000:
        raise HTTPException(status_code=400, detail="Message is too long (max 4000 characters).")
    if not database.get_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found.")

    history = database.get_messages(conversation_id)
    text, sources, searched = openai_client.get_response(
        history, request.message.strip(), "auto", request.effort,
        request.image, None, None
    )
    database.save_messages(
        conversation_id, request.message.strip(), text,
        request.image, None, None
    )

    new_title = None
    if len(history) <= 4:
        existing_title = database.get_conversation_title(conversation_id)
        if not existing_title:
            new_title = openai_client.generate_title(request.message.strip(), text)
            if new_title:
                database.update_conversation_title(conversation_id, new_title)

    return {"response": text, "sources": sources, "searched": searched, "title": new_title}


@app.post("/api/conversations/{conversation_id}/messages/stream")
def send_message_stream(conversation_id: int, request: MessageRequest):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    if len(request.message.strip()) > 4000:
        raise HTTPException(status_code=400, detail="Message is too long (max 4000 characters).")
    if not database.get_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found.")

    history = database.get_messages(conversation_id)

    def generate():
        full_text = []
        sources = []
        searched = False

        for event in openai_client.stream_response(
            history, request.message.strip(), "auto", request.effort,
            request.image, None, None
        ):
            if event["type"] == "chunk":
                full_text.append(event["text"])
                yield f"data: {json.dumps(event)}\n\n"

            elif event["type"] == "done":
                sources = event["sources"]
                searched = event["searched"]
                complete_text = "".join(full_text)

                database.save_messages(
                    conversation_id, request.message.strip(), complete_text,
                    request.image, None, None
                )

                # Send done immediately — don't block on title generation
                event["title"] = None
                yield f"data: {json.dumps(event)}\n\n"

                # Generate title in background so the client isn't kept waiting
                if len(history) <= 4:
                    existing_title = database.get_conversation_title(conversation_id)
                    if not existing_title:
                        def _gen_title(msg, resp, conv_id):
                            title = openai_client.generate_title(msg, resp)
                            if title:
                                database.update_conversation_title(conv_id, title)
                        threading.Thread(
                            target=_gen_title,
                            args=(request.message.strip(), complete_text, conversation_id),
                            daemon=True,
                        ).start()

            elif event["type"] == "error":
                yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

