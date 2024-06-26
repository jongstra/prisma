from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # This should enable CORS for all routes.

@app.route('/api/data')
def get_data():
    # data = {'message': 'Hello from Flask!'}
    with open('tactics_and_techniques.json') as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5001)