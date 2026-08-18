# Revise — Notes-to-Flashcards Study App

Revise is a minimal, exam-oriented full-stack web application designed for students revising dense technical material (e.g., Operating Systems, DBMS, Networking, System Design). It takes study notes (via pasted text or an uploaded `.pdf` / `.txt` file) and produces:
1. A concise, structured markdown summary of key definitions, mechanics, and relationships.
2. A set of 10–15 testable flashcard Q&A pairs (supporting concepts, comparisons, and direct recall).
3. An Anki-importable CSV file export of the generated flashcard deck.

---

## Tech Stack
- **Backend:** FastAPI (Python 3.11+), Uvicorn, pypdf (for PDF text extraction)
- **Frontend:** React (Vite), Plain CSS (custom dark-mode glassmorphic theme), Lucide React
- **LLM:** Gemini API (Gemini 2.5 Flash: `gemini-2.5-flash`)

---

## Setup & Running Locally

### 1. Prerequisites
- Python 3.11+ (verified on Python 3.14.3)
- Node.js (v18+) and npm

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   * **Windows:**
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   * **macOS/Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set your Gemini API Key environment variable (grab a key at aistudio.google.com):
   * **Windows (Command Prompt):**
     ```cmd
     set GEMINI_API_KEY=your_api_key_here
     ```
   * **Windows (PowerShell):**
     ```powershell
     $env:GEMINI_API_KEY="your_api_key_here"
     ```
   * **macOS/Linux:**
     ```bash
     export GEMINI_API_KEY="your_api_key_here"
     ```
5. Run the backend server with Uvicorn:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will run on `http://127.0.0.1:8000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The application will be accessible in your web browser at `http://localhost:5173`.

---

## Verification & Usage

1. **Paste Notes or Upload Files:** Type or paste study material directly in the textarea, or drag-and-drop a `.pdf` or `.txt` file into the upload zone. Note: Pasting text clears any selected files and vice versa.
2. **Review Summary & Study Flashcards:** Once distilled, you'll see a side-by-side view. Read the markdown summary on the left. Flip cards in the Study Carousel or toggle Grid View on the right to test yourself.
3. **Anki CSV Export:** Click "Export to Anki CSV" to download `revise-flashcards.csv`. Open the Anki application, click **Import File**, choose the CSV, and map Column 1 to *Front* and Column 2 to *Back*.
