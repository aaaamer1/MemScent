import os, json
from openai import OpenAI

# 1. Load your 8-oil palette
with open(os.path.join(os.path.dirname(__file__), '../recipes/scentLibrary.json')) as f:
    scent_library = json.load(f)

# 2. Build the prompt (using f-string, doubling braces for literal JSON)
OILS = ", ".join(o['name'] for o in scent_library)
def make_prompt(intent: str) -> str:
    return f"""
You are an expert perfumer. Given these oils:
{OILS}

Suggest a three-oil blend for the user intent: "{intent}".
Return ONLY JSON with {{"name":string,"components":[{{"oil":string,"percent":number}},…]}}.
""".strip()

# 3. Instantiate the new client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_recipe(intent: str) -> dict:
    prompt = make_prompt(intent)
    resp = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user",   "content": prompt}
        ]
    )
    return json.loads(resp.choices[0].message.content)

if __name__ == "__main__":
    intent = input("Enter scent intent: ")
    print(json.dumps(generate_recipe(intent), indent=2))

