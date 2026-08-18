from fastapi import FastAPI, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import io
import csv

from file_parsing import parse_pdf, parse_txt
from llm import generate_summary_and_flashcards

app = FastAPI(title="Revise Backend", version="1.0.0")

# CORS setup for local development and deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local and deployed frontend
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Flashcard(BaseModel):
    question: str
    answer: str

@app.post("/api/process")
async def process_notes(request: Request):
    """
    Processes notes text or an uploaded PDF/TXT file, summarizes the content,
    and returns a structured JSON response containing markdown summary and flashcards.
    """
    content_type = request.headers.get("content-type", "")
    text = ""
    
    if "multipart/form-data" in content_type:
        form = await request.form()
        print("Form keys received:", list(form.keys()))
        uploaded_file = form.get("file")
        print("Uploaded file object:", uploaded_file, "Type:", type(uploaded_file))
        
        if not uploaded_file or not hasattr(uploaded_file, "filename"):
            raise HTTPException(status_code=400, detail=f"No file was uploaded in the file field. Received keys: {list(form.keys())}, type of file field: {type(uploaded_file)}")
            
        filename = uploaded_file.filename
        if not filename:
            raise HTTPException(status_code=400, detail="Uploaded file has no filename.")
            
        if not (filename.endswith(".pdf") or filename.endswith(".txt")):
            raise HTTPException(status_code=400, detail="Unsupported file format. Only .pdf and .txt are supported.")
            
        file_bytes = await uploaded_file.read()
        
        if filename.endswith(".pdf"):
            try:
                text = parse_pdf(file_bytes)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")
        else:
            try:
                text = parse_txt(file_bytes)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error reading text file: {str(e)}")
                
    elif "application/json" in content_type:
        try:
            body = await request.json()
            text = body.get("text", "")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON format.")
    else:
        raise HTTPException(status_code=400, detail="Unsupported content type. Must be application/json or multipart/form-data.")
        
    text = text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="No study material was provided or extracted text is empty.")
        
    # Validation: Cap at 15,000 characters. If longer, truncate and set flag.
    truncated = False
    max_chars = 15000
    if len(text) > max_chars:
        text = text[:max_chars]
        truncated = True
        
    try:
        result = generate_summary_and_flashcards(text)
        return {
            "summary": result.get("summary", ""),
            "flashcards": result.get("flashcards", []),
            "truncated": truncated
        }
    except ValueError as ve:
        # API key missing or local validation failed
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        # LLM processing failure
        raise HTTPException(status_code=502, detail=str(e))

@app.post("/api/export-csv")
async def export_csv(flashcards: List[Flashcard]):
    """
    Exports flashcards array into an Anki-compatible two-column CSV.
    """
    if not flashcards:
        raise HTTPException(status_code=400, detail="Flashcards array cannot be empty.")
        
    # Use python's csv library to construct the CSV with safe escaping
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL, lineterminator="\n")
    
    # Write flashcards: column 1 = question, column 2 = answer
    for card in flashcards:
        writer.writerow([card.question.strip(), card.answer.strip()])
        
    output.seek(0)
    
    # Stream the bytes back to the browser
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="revise-flashcards.csv"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
