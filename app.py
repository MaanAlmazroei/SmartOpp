from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import pandas as pd
import fitz  # PyMuPDF for PDF text extraction

app = Flask(__name__)

# === Load CV Classifier ===
cv_model_path = "./my_cv_classifier"
cv_tokenizer = AutoTokenizer.from_pretrained(cv_model_path)
cv_model = AutoModelForSequenceClassification.from_pretrained(cv_model_path)

cv_classifier = pipeline(
    "text-classification",
    model=cv_model,
    tokenizer=cv_tokenizer,
    function_to_apply="softmax",
    truncation=True,
    max_length=512
)

# === Load Job Dataset ===
jobs_csv = "./classified_wadhefa_dataset.csv"
df_jobs = pd.read_csv(jobs_csv)

# Label mapping (same used in training CV classifier)
id_to_label = {
    0: "IT",
    1: "Marketing",
    2: "Finance",
    3: "Engineering",
    4: "Healthcare",
    5: "Education"
}

# === Helper: Extract text from PDF ===
def extract_text_from_pdf(file) -> str:
    text = ""
    with fitz.open(stream=file.read(), filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text.strip()

# === API: Upload CV and Get Matches ===
@app.route("/match", methods=["POST"])
def match_jobs():
    if "cv" not in request.files:
        return jsonify({"error": "No CV uploaded"}), 400

    # Extract text from uploaded CV
    file = request.files["cv"]
    cv_text = extract_text_from_pdf(file)

    if not cv_text:
        return jsonify({"error": "Empty CV"}), 400

    # Predict CV category
    result = cv_classifier(cv_text[:1000])[0]  # limit text length
    label_idx = int(result["label"].split("_")[-1])
    cv_category = id_to_label.get(label_idx, "Unknown")

    # Match jobs
    matched = df_jobs[df_jobs["predicted_category"] == cv_category].head(5)
    jobs = matched[["description", "url", "predicted_category"]].to_dict(orient="records")

    return jsonify({
        "cv_category": cv_category,
        "jobs": jobs
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860)
