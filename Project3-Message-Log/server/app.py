from flask import Flask, request, jsonify
from flask_cors import CORS

# Terminal 1: python3 server/app.py
# Terminal 2: python3 -m http.server 5500

app = Flask(__name__)
CORS(app) # Apply CORS rules to the entire application

MESSAGE_FILE = "messages.txt"


@app.route("/messages", methods=["POST"]) # When Flask receives a POST request whose path is /messages, run add_message()
def add_message():
    message = request.get_data(as_text=True) # Take whatever the client put in the HTTP request body and turn it into text

    with open(MESSAGE_FILE, "a") as file:
        file.write(message + "\n")

    return "", 201

@app.route("/messages", methods=["GET"])
def get_messages():
    with open(MESSAGE_FILE, "r") as file:
        messages = file.readlines()

    messages = [message.rstrip("\n") for message in messages]

    return jsonify(messages), 200

@app.errorhandler(404)
def not_found(error):
    return "The requested resource was not found.", 404


if __name__ == "__main__":
    app.run(debug=True)