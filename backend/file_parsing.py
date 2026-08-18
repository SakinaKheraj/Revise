import io
from pypdf import PdfReader

def parse_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from PDF bytes page by page.
    """
    pdf_file = io.BytesIO(file_bytes)
    reader = PdfReader(pdf_file)
    text_content = []
    
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_content.append(page_text)
            
    return "\n".join(text_content)

def parse_txt(file_bytes: bytes) -> str:
    """
    Decodes txt file bytes to string.
    """
    return file_bytes.decode("utf-8", errors="replace")
