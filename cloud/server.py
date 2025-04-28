#loads the scent regressor model and serves it via FastAPI
#cant import joblib directly in next.js so microservice does the ml work
from fastapi import FastAPI
from pydantic import BaseModel
import joblib, json
from openai import OpenAI
import os

OILS = [ "Coffee", "Oud Wood", "Bergamot", "Lavender", "Rose", "Cherry",
     "Vanilla", "Strawberry", "Sweet Orange", "Mango",
     "Frankincense", "Cinnamon", "Rosemary", "Jasmine",
     "Tea Tree", "Vetiver", "Sandalwood", "Lemon"]

app = FastAPI()
model_path = os.path.join(os.path.dirname(__file__), "scent_regressor.joblib")
reg = joblib.load(model_path)
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

class PredictRequest(BaseModel):
    memory: str

@app.post("/predict")
def predict(req: PredictRequest):
    emb = client.embeddings.create(
        model="text-embedding-3-small", input=req.memory
    ).data[0].embedding
    preds = reg.predict([emb])[0]
    preds = [max(0, p) for p in preds]
    total = sum(preds) or 1
    normed = [round(p/total*100) for p in preds]
    comps = sorted(
      [{"oil":OILS[i],"percent":normed[i]} for i in range(len(OILS))],
      key=lambda x: -x["percent"]
    )[:3]
    return {"recipe":{"name":req.memory,"components":comps}}
