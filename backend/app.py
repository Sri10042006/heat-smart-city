from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "message": "Heat Smart City Backend is running",
        "status": "active"
    })

if __name__ == "__main__":
    app.run(debug=True)
