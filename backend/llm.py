import os
import json
import time
from typing import Dict, Any
from google import genai
from google.genai import types
from google.genai.errors import APIError

SYSTEM_PROMPT = """
You are an expert exam-prep assistant. Your task is to analyze the provided study notes and produce:
1. A concise, well-structured markdown summary of the material.
2. A list of 10 to 15 testable flashcard Q&A pairs.

Guidelines for the summary:
- Focus on key definitions, core concepts, formulas, architectures, and relationships.
- Keep it exam-oriented, precise, and free of fluff.
- Use clear bullet points and bold terms.

Guidelines for the flashcards:
- Flashcards must be precise, testable, and direct. Avoid vague questions (e.g., do NOT ask "What is discussed in section 1?").
- Vary the styles of questions:
  - Direct concept/definition recall (e.g., "What is X?")
  - Comparison/contrast (e.g., "What is the difference between X and Y?")
  - Conceptual mechanics (e.g., "Why does X happen under Y condition?")
  - Problem-solving or scenario-based recall (e.g., "Under Z load, which component handles W?")
- Provide concise but complete answers.
- Target exactly 10 to 15 flashcards.

If the input text is empty, too sparse, or completely incoherent to generate meaningful study aids, return:
{
  "summary": "The input text is insufficient or incoherent to generate study materials. Please provide clearer or more detailed notes.",
  "flashcards": []
}

Output Requirements:
- You must output a single, valid JSON object containing exactly two keys: "summary" and "flashcards".
- Crucial: The value of "summary" must be a valid JSON string value. The entire summary markdown text must be properly enclosed in double quotes. All newlines within the summary must be escaped as \\n, and any double quotes must be escaped as \\\". 
- The value of "flashcards" must be a JSON array of objects, where each object has "question" and "answer" keys.
- Do not include any introductory text, markdown code blocks, or explanations. Just return the raw JSON object.

Expected JSON schema:
{
  "summary": "concise markdown summary text here with escaped newlines \\n",
  "flashcards": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}
"""

def generate_summary_and_flashcards(text: str) -> Dict[str, Any]:
    """
    Calls Gemini API with gemini-2.5-flash model to generate a summary and flashcards.
    Uses JSON response_mime_type and handles rate-limiting / API errors with exponential backoff.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Fallback: manually parse local .env file if present
        try:
            env_path = os.path.join(os.path.dirname(__file__), ".env")
            if os.path.exists(env_path):
                with open(env_path, "r") as f:
                    for line in f:
                        if line.strip().startswith("GEMINI_API_KEY="):
                            api_key = line.strip().split("=", 1)[1].strip('"\' ')
                            os.environ["GEMINI_API_KEY"] = api_key
                            break
        except Exception:
            pass

    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Please get a key at aistudio.google.com and set it in terminal or in a backend/.env file.")

    client = genai.Client(api_key=api_key)
    
    max_retries = 3
    retry_delay = 2.0  # Initial delay in seconds
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"Here is the study material:\n\n{text}",
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    temperature=0.1,
                )
            )
            
            raw_content = response.text
            if not raw_content:
                raise ValueError("Gemini API returned an empty response.")
                
            return json.loads(raw_content.strip())
            
        except APIError as api_err:
            if attempt == max_retries - 1:
                raise RuntimeError(f"Gemini API error occurred: {str(api_err)}")
            print(f"Gemini API error on attempt {attempt + 1}: {str(api_err)}. Retrying in {retry_delay}s...")
            time.sleep(retry_delay)
            retry_delay *= 2.0
            
        except json.JSONDecodeError as json_err:
            if attempt == max_retries - 1:
                raise RuntimeError(f"Gemini output parsing failed after validation/parsing errors: {str(json_err)}")
            print(f"Gemini parsing failed on attempt {attempt + 1}: {str(json_err)}. Retrying in {retry_delay}s...")
            time.sleep(retry_delay)
            retry_delay *= 1.5
            
        except Exception as err:
            # Serious uncaught failures
            raise RuntimeError(f"Failed to process flashcards with Gemini: {str(err)}")
            
    raise RuntimeError("Failed to generate flashcards after multiple attempts.")

