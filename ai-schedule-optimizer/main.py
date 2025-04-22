from flask_cors import CORS
from flask import Flask, request, jsonify
from model_logic import optimize_schedule

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/optimize", methods=["POST"])
def optimize():
    try:
        data = request.get_json(force=True)
        print("Received data:", data)
        optimized = optimize_schedule(data["timetables"], data["users"])
        return jsonify(optimized)
    except Exception as e:
        print("Error in /optimize:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5005, debug=True)
