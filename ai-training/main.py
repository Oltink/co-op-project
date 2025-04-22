import pandas as pd
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import matplotlib.pyplot as plt
import numpy as np
import os

# 1. Load dataset
df = pd.read_csv("data/synthetic_schedule_dataset.csv")

# 2. Remove problematic columns or ones that aren't needed
df = df.drop(columns=["student_ids"], errors="ignore")  # student_ids is a list-like string

# 3. Define categorical features
cat_features = [
    "course_id", "course_name",
    "professor_id", "professor_name",
    "day", "time", "preferred_slot"
]

# 4. Set categorical dtype
for col in cat_features:
    if col in df.columns:
        df[col] = df[col].astype("category")

# 5. Define target and features
y = df["preferred_slot"]
X = df.drop(columns=["preferred_slot"])

# 6. Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 7. Train CatBoost model
model = CatBoostClassifier(verbose=0, random_state=42)
model.fit(X_train, y_train, cat_features=[col for col in cat_features if col in X.columns])

# 8. Accuracy
preds = model.predict(X_test)
acc = accuracy_score(y_test.astype(str), preds.astype(str))
print(f"🔍 Accuracy: {acc:.4f}")

# 9. Sample predictions
sample = X_test.iloc[:5]
sample_pred = model.predict(sample)
sample_pred = np.ravel(sample_pred)  # ensure it's 1D

print("\n Sample predictions:")
print(pd.DataFrame({
    "course_name": sample["course_name"].values,
    "professor_name": sample["professor_name"].values,
    "day": sample["day"].values,
    "time": sample["time"].values,
    "predicted_slot": sample_pred
}))

# 10. Feature importance
feature_importance = model.get_feature_importance()
feature_names = X.columns

plt.figure(figsize=(10, 5))
plt.barh(feature_names, feature_importance)
plt.xlabel("Importance")
plt.title("Feature Importance")
plt.tight_layout()
plt.show()

# 11. Save model
os.makedirs("models", exist_ok=True)
model.save_model("models/catboost_schedule_model.cbm")

# 12. Prediction function
def predict_optimal_slot(data: pd.DataFrame):
    return model.predict(data)

# 13. Predict full schedule
df["predicted_slot"] = model.predict(X)
df_sorted = df.sort_values(by=["predicted_slot", "day", "time", "course_name"])

print("\n Full Predicted Schedule:")
print(df_sorted[["course_name", "professor_name", "day", "time", "predicted_slot"]].head(20))

df_sorted.to_csv("data/predicted_schedule.csv", index=False)

# 🔁 Example usage
print("\n📌 Predicted slots:", predict_optimal_slot(X_test.head(3)))
