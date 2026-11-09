import os
from flask import Flask, jsonify, request, session, make_response
from flask_cors import CORS
from database import EnemyDatabase
from functools import wraps
from werkzeug.security import check_password_hash


app = Flask(__name__)

app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY")
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH")

# Check that both environment variables exist when the application starts:
if not app.config["SECRET_KEY"] or not ADMIN_PASSWORD_HASH:
    raise RuntimeError("Missing required environment variables.")

db = EnemyDatabase()

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:5500" # Allows requests from live server origin.
    response.headers["Access-Control-Allow-Credentials"] = "true" # Allows the browser to send and receive session cookies.
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS" # Lists the HTTP methods the API supports.
    response.headers["Access-Control-Allow-Headers"] = "Content-Type" # Allows the frontend to send JSON using Content-Type

    return response

def requires_admin(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if not session.get("is_admin"):
            return jsonify({"error": "Administrator authentication required"}), 401

        return func(*args, **kwargs) # *args and **kwargs allow the decorator to work with routes that receive parameters, such as enemy_id.

    return decorated_function

@app.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not isinstance(data.get("password"), str):
        return jsonify({"error": "A password is required."}), 400

    password = data["password"]

    if not check_password_hash(ADMIN_PASSWORD_HASH, password):
        return jsonify({"error": "Incorrect password."}), 401

    session.clear()
    session["is_admin"] = True

    return jsonify({"success": "Administrator logged in."}), 200

@app.route("/admin/logout", methods=["POST"])
def admin_logout():
    session.clear()

    return jsonify({"success": "Administrator logged out."}), 200

@app.route("/admin/status", methods=["GET"])
def admin_status():
    return jsonify({
        "is_admin": session.get("is_admin", False)
    }), 200


@app.route("/enemies", methods=["GET"])
def get_all_enemies():
    enemies = db.get_all_enemies()
    
    return jsonify(enemies), 200

@app.route("/enemies/<int:enemy_id>", methods=["GET"])
def get_enemy(enemy_id):
    enemy = db.get_enemy(enemy_id)

    if enemy is None:
        return jsonify({"error": "Enemy not found."}), 404
    
    return jsonify(enemy), 200

@app.route("/enemies", methods=["POST"])
@requires_admin
def add_enemy():
    enemy = request.get_json() # retrieve the JSON body sent by the client and returns as a python dictionary
    
    enemy_id = db.add_enemy(enemy)

    return jsonify({"success": f"{enemy['name']}, ID: {enemy_id} added to enemies."}), 201

@app.route("/enemies/<int:enemy_id>", methods=["PUT"])
@requires_admin
def update_enemy(enemy_id):
    enemy = request.get_json()

    updated = db.update_enemy(enemy_id, enemy)

    if not updated:
        return jsonify({"error": "Enemy not found."}), 404

    return jsonify({"success": "Enemy updated."}), 200

@app.route("/enemies/<int:enemy_id>", methods=["DELETE"])
@requires_admin
def delete_enemy(enemy_id):
    deleted = db.delete_enemy(enemy_id)

    if not deleted:
        return jsonify({"error": "Enemy not found."}), 404

    return jsonify({"success": "Enemy deleted."}), 200


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "The requested resource was not found."}), 404

if __name__ == "__main__":
    app.run(debug=True)