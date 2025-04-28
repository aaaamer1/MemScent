#reads feedback.json for entries with rating >= 3
# and converts each to a fixed length oil percentage vector
# gets openai embeddings for each memory
# trains a multioutput regressor (randomforest) on the data
# to predict those % vector, and saves the model to scent_regressor.joblib

import os
import json
import numpy as np
import joblib
from openai import OpenAI
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor

BASEDIR = os.path.dirname(__file__)
FEEDBACK_PATH = os.path.join(BASEDIR, "feedback.json")
MODEL_PATH    = os.path.join(BASEDIR, "scent_regressor.joblib")

OILS = [
     "Coffee", "Oud Wood", "Bergamot", "Lavender", "Rose", "Cherry",
     "Vanilla", "Strawberry", "Sweet Orange", "Mango",
     "Frankincense", "Cinnamon", "Rosemary", "Jasmine",
     "Tea Tree", "Vetiver", "Sandalwood", "Lemon"
]

fb = json.load(open(FEEDBACK_PATH, "r"))

data = []
for e in fb:
    if e["rating"] >= 3:
        vec = [0] * len(OILS)
        for c in e["recipe"]["components"]:
            idx = OILS.index(c["oil"])
            vec[idx] = c["percent"]
        data.append((e["memory"], vec))

if not data:
    print("❌ No positive feedback entries found. Rate some recipes 👍 first.")
    exit(1)

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
X, y = [], []
for text, vec in data:
    resp = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    X.append(resp.data[0].embedding)
    y.append(vec)

X = np.array(X)
y = np.array(y)

base = RandomForestRegressor(n_estimators=100, random_state=42)
reg = MultiOutputRegressor(base)
reg.fit(X, y)

joblib.dump(reg, MODEL_PATH)
print(f"✅ Trained and saved model to {MODEL_PATH}")
