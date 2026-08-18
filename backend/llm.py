import os
import json
import time
import groq
from typing import Dict, Any

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
    Calls Groq's API with Llama 3.3 70B model to generate a summary and flashcards.
    Uses Groq JSON mode and handles rate-limiting with exponential backoff.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        # Fallback: manually parse local .env file if present
        try:
            env_path = os.path.join(os.path.dirname(__file__), ".env")
            if os.path.exists(env_path):
                with open(env_path, "r") as f:
                    for line in f:
                        if line.strip().startswith("GROQ_API_KEY="):
                            api_key = line.strip().split("=", 1)[1].strip('"\' ')
                            os.environ["GROQ_API_KEY"] = api_key
                            break
        except Exception:
            pass

    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set. Please get a free key at console.groq.com and set it in terminal or in a backend/.env file.")

    client = groq.Groq(api_key=api_key)
    
    max_retries = 3
    retry_delay = 2.0  # Initial delay in seconds
    
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": f"Here is the study material:\n\n{text}"
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            
            raw_content = response.choices[0].message.content
            if not raw_content:
                raise ValueError("Groq returned an empty response.")
                
            return json.loads(raw_content.strip())
            
        except groq.RateLimitError as rl_err:
            if attempt == max_retries - 1:
                raise RuntimeError(f"Groq API rate limit exceeded. Please try again. Details: {str(rl_err)}")
            print(f"Groq rate limit hit on attempt {attempt + 1}. Retrying in {retry_delay}s...")
            time.sleep(retry_delay)
            retry_delay *= 2.0
            
        except (json.JSONDecodeError, groq.APIError) as api_err:
            # Catch JSON decoding failures and API Gateway validation errors and retry
            if attempt == max_retries - 1:
                raise RuntimeError(f"Groq processing failed after validation/parsing errors: {str(api_err)}")
            print(f"Groq validation/parsing failed on attempt {attempt + 1}: {str(api_err)}. Retrying in {retry_delay}s...")
            time.sleep(retry_delay)
            retry_delay *= 1.5
            
        except Exception as err:
            # Serious uncaught failures
            raise RuntimeError(f"Failed to process flashcards with Groq: {str(err)}")
            
    raise RuntimeError("Failed to generate flashcards after multiple attempts.")
