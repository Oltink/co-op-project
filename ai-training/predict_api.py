from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from catboost import CatBoostClassifier

# Load the trained model
model = CatBoostClassifier()
model.load_model("models/catboost_schedule_model.cbm")

# Initialize FastAPI app
app = FastAPI()

# Define input data model
class ScheduleInput(BaseModel):
    course_name: str
    professor_name: str
    slot: str

# Root route
@app.get("/")
def read_root():
    return {"message": "🧠 Schedule Optimizer API is running"}

# Prediction endpoint
@app.post("/predict")
def predict_slot(input_data: ScheduleInput):
    # Prepare input dataframe
    df = pd.DataFrame([input_data.dict()])
    df = df.astype({"course_name": "category", "professor_name": "category"})

    # Predict slot
    prediction = model.predict(df)
    return {"predicted_slot": prediction[0]}
