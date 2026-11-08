import io
import csv
from pathlib import Path

MAX_WORDS = 40_000


def _parse_pdf(data: bytes) -> str:
    import pypdf
    reader = pypdf.PdfReader(io.BytesIO(data))
    pages = []
    for i, page in enumerate(reader.pages, 1):
        text = page.extract_text()
        if text and text.strip():
            pages.append(f"[Page {i}]\n{text.strip()}")
    if not pages:
        raise ValueError(
            "No text could be extracted from this PDF. "
            "It may be a scanned/image-based PDF without embedded text. "
            "Please use a text-based PDF, or export from a text editor."
        )
    return "\n\n".join(pages)


def _parse_docx(data: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(data))
    parts = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        if para.style and para.style.name.lower().startswith("heading"):
            parts.append(f"\n## {text}")
        else:
            parts.append(text)
    for table in doc.tables:
        rows = []
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells]
            if any(cells):
                rows.append(" | ".join(cells))
        if rows:
            parts.append("\n[Table]\n" + "\n".join(rows))
    if not parts:
        raise ValueError("The Word document appears to be empty.")
    return "\n\n".join(parts)


def _parse_xlsx(data: bytes) -> str:
    import openpyxl
    wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
    sheets = []
    for name in wb.sheetnames:
        ws = wb[name]
        rows = []
        for row in ws.iter_rows(values_only=True):
            vals = [str(v) if v is not None else "" for v in row]
            if any(v.strip() for v in vals):
                rows.append(" | ".join(vals))
        if rows:
            sheets.append(f"[Sheet: {name}]\n" + "\n".join(rows))
    wb.close()
    if not sheets:
        raise ValueError("The Excel workbook appears to be empty.")
    return "\n\n".join(sheets)


def _parse_csv(data: bytes) -> str:
    text = data.decode("utf-8", errors="replace")
    reader = csv.reader(text.splitlines())
    rows = []
    for row in reader:
        clean = [c.strip() for c in row]
        if any(clean):
            rows.append(" | ".join(clean))
    if not rows:
        raise ValueError("The CSV file appears to be empty.")
    return "\n".join(rows)


def _parse_text(data: bytes) -> str:
    text = data.decode("utf-8", errors="replace").strip()
    if not text:
        raise ValueError("The file appears to be empty.")
    return text


_PARSERS = {
    ".pdf":  ("PDF",                _parse_pdf),
    ".docx": ("Word document",      _parse_docx),
    ".txt":  ("text file",          _parse_text),
    ".md":   ("Markdown file",      _parse_text),
    ".csv":  ("CSV file",           _parse_csv),
    ".xlsx": ("Excel spreadsheet",  _parse_xlsx),
}

SUPPORTED_EXTENSIONS = set(_PARSERS.keys())


def parse_document(file_bytes: bytes, filename: str) -> dict:
    ext = Path(filename).suffix.lower()
    if ext not in _PARSERS:
        supported = ", ".join(sorted(_PARSERS.keys()))
        raise ValueError(
            f"Unsupported file format '{ext}'. Supported: {supported}"
        )

    fmt_name, parser_fn = _PARSERS[ext]

    try:
        text = parser_fn(file_bytes)
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError(f"Failed to parse {fmt_name}: {exc}")

    text = text.strip()
    if not text:
        raise ValueError(f"No content could be extracted from this {fmt_name}.")

    words = text.split()
    truncated = len(words) > MAX_WORDS
    if truncated:
        text = " ".join(words[:MAX_WORDS])
        text += f"\n\n[Document truncated: first {MAX_WORDS:,} of {len(words):,} words shown]"

    return {
        "text": text,
        "truncated": truncated,
        "word_count": min(len(words), MAX_WORDS),
        "format": fmt_name,
    }
