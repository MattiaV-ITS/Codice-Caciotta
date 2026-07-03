import requests

try:
    response = requests.get("http://localhost:11434/api/tags")
    print("Response status code:", response.status_code)
    print("Response content:", response.text)
except Exception as e:
    print("Error:", e)