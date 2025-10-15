from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({"msg": "visora backend running", "status": "ok"})

@app.route("/health")
def health():
    return jsonify({"health": "good"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
