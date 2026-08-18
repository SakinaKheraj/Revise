import json
import urllib.request
import urllib.error

def test_export_csv():
    url = "http://127.0.0.1:8000/api/export-csv"
    data = [
        {"question": "What is OS?", "answer": "Operating System"},
        {"question": "Explain ACID properties.", "answer": "Atomicity, Consistency, Isolation, Durability."}
    ]
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as response:
            print("Status:", response.status)
            print("Headers:", dict(response.info()))
            body = response.read().decode("utf-8")
            print("Body:\n", body)
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code, e.read().decode())
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    print("Testing /api/export-csv:")
    test_export_csv()
