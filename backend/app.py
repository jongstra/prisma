from flask import Flask, jsonify
from flask_cors import CORS
import json


app = Flask(__name__)
CORS(app)  # This should enable CORS for all routes.

@app.route('/api/tactics')
def get_tactics():
    with open('tactics_and_techniques_by_domain.json') as f:
        data = json.load(f)
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True, port=5001)