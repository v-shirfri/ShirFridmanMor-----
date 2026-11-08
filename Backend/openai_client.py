import io
import os
from dotenv import load_dotenv
from fastapi import HTTPException
from openai import OpenAI, AuthenticationError, APIConnectionError, RateLimitError, OpenAIError

load_dotenv()

SYSTEM_PROMPT = """אתה ChatAI — עוזר בינה מלאכותית חכם, אמין ומבוסס, שנבנה על ידי שיר פרידמן מור כפרויקט גמר בפיתוח Full Stack.

## זהות
- נבנה על ידי שיר פרידמן מור כפרויקט גמר בלימודי פיתוח Full Stack
- מופעל באמצעות ה-API של OpenAI — OpenAI לא בנתה ואינה מחזיקה באתר זה
- כשנשאלים מי בנה את האפליקציה: שיר פרידמן מור, בשימוש בטכנולוגיית OpenAI API

## העיקרון החשוב ביותר — דיוק ואמינות
**עדיף להודות בחוסר ידע מאשר לספק מידע שגוי או מומצא.**

### כללי חובה
1. **אין להמציא מידע** — לעולם אל תמציא שמות, אנשים, דמויות, שחקנים, אירועים, תאריכים, ציטוטים, נתונים, מקורות או עובדות. אם אינך יודע — אמור זאת.
2. **בדיקת ביטחון לפני תשובה** — לפני שאתה משיב על שאלה עובדתית, הערך האם המידע מבוסס על ידע מהימן או על השערה. אל תציג השערה כעובדה.
3. **הבעת חוסר ודאות** — אם אינך יודע בוודאות, אמור זאת בצורה ברורה. לדוגמה: "אני לא בטוח בכך" או "אין לי מספיק מידע כדי לאמת זאת".
4. **שמות ופרטים מדויקים** — בשאלות על דמויות בסדרות, שחקנים, סרטים, ספרים, אישים ותפקידים — הקפד במיוחד שלא לבלבל בין שמות או לשייך אדם לתפקיד ללא בסיס אמין.
5. **ללא השלמת פרטים בניחוש** — אם אתה מכיר רק חלק מהתשובה, מסור את החלק שאתה יודע. אל תשלים את השאר בהמצאות.
6. **תיקון טעויות קודמות** — אל תניח שתשובה קודמת שלך הייתה נכונה. אם המשתמש מערער, בחן את המידע מחדש באופן עצמאי. אם גילית טעות, הודה בה ותקן אותה.
7. **שימוש בחיפוש לאימות** — כשיש גישה לחיפוש אינטרנטי, השתמש בו לאימות פרטים שאינך בטוח בהם. לעולם אל תמציא קישורים, ציטוטים או מקורות.
8. **ללא טענת אימות שקרית** — אם אין לך אפשרות לבדוק מידע עדכני, אל תטען שבדקת. הסבר את מגבלת האימות.
9. **התנגדות להנחות שגויות** — גם אם המשתמש שואל שאלה שמניחה עובדה לא נכונה, אל תאשר אותה. בדוק אם ההנחה מבוססת ותקן במידת הצורך.
10. **דיוק חשוב יותר מריצוי** — לעולם אל תספק תשובה רק מפני שהיא נשמעת הגיונית או מפני שחשבת שזה מה שהמשתמש רוצה לשמוע.
11. **הבחנה בין עובדה לפרשנות** — הפרד בין עובדות מבוססות, הערכות, דעות ומידע שלא אומת.

## שפה ועיצוב
- השב בשפה שבה כותב המשתמש — עברית לתשובות עבריות, אנגלית לתשובות אנגליות
- עברית: עברית ישראלית שוטפת ותקינה, כולל ניסוח טבעי ורוחבי (RTL)
- שמור קוד, פקודות, URLs ומזהים טכניים בצורה המקורית (LTR)
- השתמש ב-Markdown (כותרות, רשימות, בלוקי קוד) כשהוא משפר את הבהירות

## מחקר אינטרנטי
יש לך גישה לחיפוש אינטרנטי בזמן אמת. השתמש בו כחוקר מומחה:

**חפש אוטומטית כאשר:**
- השאלה עוסקת בנתונים שמשתנים: מחירים, שערים, חדשות, מזג אוויר, סטטיסטיקות
- הנושא נוגע להתפתחויות אחרונות, מוצרים, חברות או מקומות ספציפיים
- המשתמש מבקש במפורש לחפש באינטרנט
- מידע מהאימון לבדו עשוי להיות מיושן

**מתודולוגיית מחקר:**
- נסח שאילתות חיפוש מדויקות התואמות את כוונת המשתמש
- אם תוצאות ראשוניות אינן מספיקות, חפש שוב עם ניסוח שונה
- השווה מספר מקורות — לעולם אל תסתמך עיוורת על מקור אחד
- העדף מקורות עדכניים וסמכותיים: אתרים רשמיים, תקשורת מוכרת, נתוני ממשלה
- כשמקורות סותרים: ציין את הסתירה והצג מה ידוע לעומת מה שבמחלוקת
- סנתז את הממצאים לתשובה קוהרנטית — אל תסתפק בסיכום קטע אחד
- ציין מקורות לטענות ספציפיות (מחירים, סטטיסטיקות, אירועים אחרונים)

**אל תחפש כאשר:**
- התשובה מגיעה מידע אמין ויציב (מתמטיקה, עובדות היסטוריות, מדע בסיסי)
- חיפוש לא יוסיף ערך משמעותי לתשובה

**לעולם לא:**
- תמציא כתובות URL, סטטיסטיקות, תאריכים או תוצאות חיפוש
- תטען שחיפשת כשלא עשית זאת
- תציג מידע מיושן מהאימון כמידע עדכני

## הקשר שיחה
אתה מקבל את היסטוריית השיחה המלאה (הן הודעות המשתמש והן תשובות קודמות שלך).
- השתמש בהקשר הקודם להבנת שאלות המשך
- הימנע מחזרה מיותרת על מידע שכבר נאמר
- לעולם אל תערבב שיחות שונות"""


def _nth_word_answer(all_turns, n):
    word_num = 0
    for turn in all_turns:
        speaker = "User" if turn["role"] == "user" else "Assistant"
        for word in turn["content"].split():
            word_num += 1
            if word_num == n:
                return word, speaker
    return None, None


_ORDINALS = {
    1: ["ראשונ", "first"],
    2: ["שנייה", "שניי", "second"],
    3: ["שלישי", "third"],
    4: ["רביעי", "fourth"],
    5: ["חמישי", "fifth"],
    6: ["שישי", "sixth"],
    7: ["שביעי", "seventh"],
    8: ["שמיני", "eighth"],
    9: ["תשיעי", "ninth"],
    10: ["עשיר", "tenth"],
}


def _detect_word_position_query(text):
    if "מילה" not in text and "word" not in text.lower():
        return None
    for n, patterns in _ORDINALS.items():
        for pat in patterns:
            if pat in text:
                return n
    return None


def _make_instructions(history, new_message):
    if not history:
        return SYSTEM_PROMPT

    all_turns = list(history) + [{"role": "user", "content": new_message}]

    lines = [
        "## WORD INDEX — use this directly to answer word-position questions.",
        "Rule: Word N = the entry labelled 'Word N' below. Do not de-duplicate.",
        "",
    ]

    precomputed = _detect_word_position_query(new_message)
    if precomputed is not None:
        word, speaker = _nth_word_answer(all_turns[:-1], precomputed)
        if word:
            lines.insert(0,
                f"ANSWER FOR THIS MESSAGE: Word {precomputed} = '{word}' (spoken by {speaker}). "
                f"Report this exactly.\n"
            )

    word_num = 1
    truncated = False
    for i, turn in enumerate(all_turns, 1):
        speaker = "User" if turn["role"] == "user" else "Assistant"
        for word in turn["content"].split():
            if word_num > 120:
                lines.append("  (index truncated at 120 words)")
                truncated = True
                break
            lines.append(f"  Word {word_num} [Turn {i}, {speaker}]: {word}")
            word_num += 1
        if truncated:
            break

    lines += ["", "## CONVERSATION TRANSCRIPT", ""]
    for i, turn in enumerate(all_turns, 1):
        speaker = "User" if turn["role"] == "user" else "Assistant"
        lines.append(f"Turn {i} [{speaker}]: {turn['content']}")

    lines += ["", SYSTEM_PROMPT]
    return "\n".join(lines)


def _extract_sources(response):
    sources = []
    seen = set()
    for item in response.output:
        if item.type == "message":
            for block in item.content:
                if block.type == "output_text":
                    for ann in getattr(block, "annotations", []) or []:
                        if ann.type == "url_citation":
                            url = getattr(ann, "url", "")
                            if url and url not in seen:
                                seen.add(url)
                                sources.append({
                                    "url": url,
                                    "title": getattr(ann, "title", "") or url,
                                })
    return sources


_GREETINGS = {"שלום", "שלום!", "היי", "היי!", "הי", "הי!", "hello", "hi", "hey", "hi!", "hey!"}


def generate_title(user_message, assistant_response):
    """Generate a short conversation title. Uses gpt-4o-mini for cost efficiency."""
    if user_message.strip().lower() in _GREETINGS:
        return None
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    client = OpenAI(api_key=api_key)
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Generate a short, descriptive title for a conversation (3-6 words max). "
                        "Match the user's language: Hebrew → Hebrew title, English → English title. "
                        "Respond with ONLY the title — no quotes, no punctuation at the end."
                    ),
                },
                {
                    "role": "user",
                    "content": f"User: {user_message[:300]}\nAssistant: {assistant_response[:200]}",
                },
            ],
            max_tokens=20,
            temperature=0.3,
        )
        title = resp.choices[0].message.content.strip().strip("\"'").strip()
        return title if len(title) > 2 else None
    except Exception:
        return None


_EFFORT_SETTINGS = {
    "fast":     {"temperature": 0.9, "search_context_size": "low",    "max_tool_calls": 1},
    "standard": {"temperature": 0.7, "search_context_size": "medium",  "max_tool_calls": 3},
    "deep":     {"temperature": 0.4, "search_context_size": "high",   "max_tool_calls": 5},
}


def get_response(history, new_message, search_mode="auto", effort="standard",
                 image_data=None, doc_text=None, doc_name=None):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key is not configured. Set OPENAI_API_KEY in Backend/.env.",
        )

    model = os.getenv("OPENAI_MODEL", "gpt-4o")
    client = OpenAI(api_key=api_key)

    # Build conversation history (may include messages with images or documents)
    messages = []
    for msg in history:
        img = msg.get("image_data")
        d_text = msg.get("doc_text")
        d_name = msg.get("doc_name")
        content = msg["content"]
        if d_text:
            label = d_name or "document"
            content = f"[Attached document: {label}]\n\n{d_text}\n\n---\n\nUser: {content}"
        if img:
            messages.append({
                "role": msg["role"],
                "content": [
                    {"type": "input_image", "image_url": img},
                    {"type": "input_text", "text": content},
                ],
            })
        else:
            messages.append({"role": msg["role"], "content": content})

    # Current user message (with optional image)
    user_content = new_message
    nth = _detect_word_position_query(new_message)
    if nth is not None:
        word, speaker = _nth_word_answer(list(history), nth)
        if word:
            user_content = (
                new_message
                + f"\n\n[VERIFIED ANSWER: Word {nth} = '{word}' spoken by {speaker}. State this directly.]"
            )

    if doc_text:
        label = doc_name or "document"
        user_content = f"[Attached document: {label}]\n\n{doc_text}\n\n---\n\nUser: {user_content}"

    if image_data:
        messages.append({
            "role": "user",
            "content": [
                {"type": "input_image", "image_url": image_data},
                {"type": "input_text", "text": user_content},
            ],
        })
    else:
        messages.append({"role": "user", "content": user_content})
    instructions = _make_instructions(history, new_message)

    effort_cfg = _EFFORT_SETTINGS.get(effort, _EFFORT_SETTINGS["standard"])

    tools = None
    max_tool_calls = effort_cfg["max_tool_calls"]
    search_ctx = effort_cfg["search_context_size"]

    if search_mode == "off":
        tools = None
        max_tool_calls = None
    elif search_mode == "on":
        tools = [{"type": "web_search", "search_context_size": "high"}]
        max_tool_calls = max(max_tool_calls, 5)
        instructions = (
            "CRITICAL: The user has explicitly enabled web search. "
            "You MUST use the web_search tool before answering. "
            "Do NOT answer from training data alone.\n\n"
        ) + instructions
    else:
        tools = [{"type": "web_search", "search_context_size": search_ctx}]

    create_kwargs = {
        "model": model,
        "instructions": instructions,
        "input": messages,
        "temperature": effort_cfg["temperature"],
    }
    if tools:
        create_kwargs["tools"] = tools
    if max_tool_calls is not None:
        create_kwargs["max_tool_calls"] = max_tool_calls

    try:
        response = client.responses.create(**create_kwargs)
        text = response.output_text or ""
        sources = _extract_sources(response)
        searched = any(getattr(item, "type", "") == "web_search_call" for item in response.output)
        return text, sources, searched

    except AuthenticationError:
        raise HTTPException(status_code=500, detail="OpenAI API key is invalid.")
    except RateLimitError:
        raise HTTPException(
            status_code=429, detail="OpenAI rate limit reached. Please try again later."
        )
    except APIConnectionError:
        raise HTTPException(
            status_code=502, detail="Could not connect to OpenAI. Please try again."
        )
    except OpenAIError as exc:
        raise HTTPException(
            status_code=502, detail=f"OpenAI request failed. Please try again."
        )


def stream_response(history, new_message, search_mode="auto", effort="standard",
                    image_data=None, doc_text=None, doc_name=None):
    """Generator that yields dicts: {type:'chunk',text}, {type:'done',sources,searched}, or {type:'error',detail}."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        yield {"type": "error", "detail": "OpenAI API key is not configured."}
        return

    model = os.getenv("OPENAI_MODEL", "gpt-4o")
    client = OpenAI(api_key=api_key)

    messages = []
    for msg in history:
        img = msg.get("image_data")
        d_text = msg.get("doc_text")
        d_name = msg.get("doc_name")
        content = msg["content"]
        if d_text:
            label = d_name or "document"
            content = f"[Attached document: {label}]\n\n{d_text}\n\n---\n\nUser: {content}"
        if img:
            messages.append({
                "role": msg["role"],
                "content": [
                    {"type": "input_image", "image_url": img},
                    {"type": "input_text", "text": content},
                ],
            })
        else:
            messages.append({"role": msg["role"], "content": content})

    user_content = new_message
    nth = _detect_word_position_query(new_message)
    if nth is not None:
        word, speaker = _nth_word_answer(list(history), nth)
        if word:
            user_content = (
                new_message
                + f"\n\n[VERIFIED ANSWER: Word {nth} = '{word}' spoken by {speaker}. State this directly.]"
            )

    if doc_text:
        label = doc_name or "document"
        user_content = f"[Attached document: {label}]\n\n{doc_text}\n\n---\n\nUser: {user_content}"

    if image_data:
        messages.append({
            "role": "user",
            "content": [
                {"type": "input_image", "image_url": image_data},
                {"type": "input_text", "text": user_content},
            ],
        })
    else:
        messages.append({"role": "user", "content": user_content})

    instructions = _make_instructions(history, new_message)
    effort_cfg = _EFFORT_SETTINGS.get(effort, _EFFORT_SETTINGS["standard"])

    tools = None
    max_tool_calls = effort_cfg["max_tool_calls"]
    search_ctx = effort_cfg["search_context_size"]

    if search_mode == "off":
        tools = None
        max_tool_calls = None
    elif search_mode == "on":
        tools = [{"type": "web_search", "search_context_size": "high"}]
        max_tool_calls = max(max_tool_calls, 5)
        instructions = (
            "CRITICAL: The user has explicitly enabled web search. "
            "You MUST use the web_search tool before answering.\n\n"
        ) + instructions
    else:
        tools = [{"type": "web_search", "search_context_size": search_ctx}]

    create_kwargs = {
        "model": model,
        "instructions": instructions,
        "input": messages,
        "temperature": effort_cfg["temperature"],
        "stream": True,
    }
    if tools:
        create_kwargs["tools"] = tools
    if max_tool_calls is not None:
        create_kwargs["max_tool_calls"] = max_tool_calls

    try:
        stream = client.responses.create(**create_kwargs)
        sources = []
        searched = False

        for event in stream:
            if event.type == "response.output_text.delta":
                yield {"type": "chunk", "text": event.delta}
            elif event.type == "response.completed":
                sources = _extract_sources(event.response)
                searched = any(
                    getattr(item, "type", "") == "web_search_call"
                    for item in event.response.output
                )

        yield {"type": "done", "sources": sources, "searched": searched}

    except AuthenticationError:
        yield {"type": "error", "detail": "OpenAI API key is invalid."}
    except RateLimitError:
        yield {"type": "error", "detail": "OpenAI rate limit reached. Please try again later."}
    except APIConnectionError:
        yield {"type": "error", "detail": "Could not connect to OpenAI. Please try again."}
    except OpenAIError:
        yield {"type": "error", "detail": "OpenAI request failed. Please try again."}


