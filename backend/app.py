from flask import Flask, jsonify, request
from backend.model.predict import mitigate

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "message": "Heat Smart City Backend is running",
        "status": "active"
    })

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json  # input from frontend / Postman

    suggestions = mitigate(data)

    return jsonify({
        "input": data,
        "mitigation_suggestions": suggestions
    })

if __name__ == "__main__":
    app.run(debug=True)

