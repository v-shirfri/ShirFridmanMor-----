import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )


def create_conversation():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO conversations (created_at) VALUES (NOW())")
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()


def get_conversation(conversation_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM conversations WHERE id = %s", (conversation_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def get_messages(conversation_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT role, content, image_data, doc_text, doc_name FROM messages "
            "WHERE conversation_id = %s ORDER BY created_at ASC, id ASC",
            (conversation_id,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def save_messages(conversation_id, user_message, assistant_response,
                  image_data=None, doc_text=None, doc_name=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO messages (conversation_id, role, content, image_data, doc_text, doc_name) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (conversation_id, "user", user_message, image_data, doc_text, doc_name),
        )
        cursor.execute(
            "INSERT INTO messages (conversation_id, role, content, image_data, doc_text, doc_name) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (conversation_id, "assistant", assistant_response, None, None, None),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def run_migrations():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        for col, definition in [
            ("title",    "VARCHAR(255) DEFAULT NULL"),
            ("image_data", "MEDIUMTEXT DEFAULT NULL"),
            ("doc_text", "MEDIUMTEXT DEFAULT NULL"),
            ("doc_name", "VARCHAR(500) DEFAULT NULL"),
        ]:
            cursor.execute(
                f"""SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = %s AND COLUMN_NAME = %s""",
                ("conversations" if col == "title" else "messages", col),
            )
            if cursor.fetchone()[0] == 0:
                table = "conversations" if col == "title" else "messages"
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {definition}")
        conn.commit()
    except Exception:
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


def get_conversation_title(conversation_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT title FROM conversations WHERE id = %s", (conversation_id,))
        row = cursor.fetchone()
        return row[0] if row else None
    finally:
        cursor.close()
        conn.close()


def update_conversation_title(conversation_id, title):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE conversations SET title = %s WHERE id = %s",
            (title, conversation_id),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def list_conversations():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT c.id, c.created_at, c.title,
                (SELECT MAX(m.created_at) FROM messages m
                 WHERE m.conversation_id = c.id) AS last_activity,
                (SELECT COUNT(*) FROM messages m
                 WHERE m.conversation_id = c.id) AS message_count
            FROM conversations c
            WHERE (SELECT COUNT(*) FROM messages m
                   WHERE m.conversation_id = c.id) > 0
            ORDER BY last_activity DESC, c.created_at DESC
            LIMIT 50
            """
        )
        rows = cursor.fetchall()
        result = []
        for row in rows:
            title = row["title"] if row["title"] else "New conversation"
            result.append(
                {
                    "id": row["id"],
                    "title": title[:80],
                    "created_at": row["created_at"].strftime("%Y-%m-%dT%H:%M:%S")
                    if row["created_at"]
                    else None,
                }
            )
        return result
    finally:
        cursor.close()
        conn.close()
