from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "msg": "Visora backend running 🚀",
        "status": "ok"
    })

@app.route("/health")
def health():
    return "healthy ✅"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
