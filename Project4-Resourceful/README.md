# Kingdom Hearts Enemy Database

A RESTful API and web application for browsing and managing enemies from Kingdom Hearts.

## Resource

**Enemy**

Each enemy represents an entry in the Kingdom Hearts enemy database. Public users can browse and retrieve enemy information, while authenticated administrators can add, update, and delete entries.

**Attributes:**

* name (string)
* description (string)
* story_phase (string) — `Before_HB` or `After_HB`
* hp (integer)
* attack (integer)
* defense (integer)
* mp_recovery (integer)
* exp (integer)
* worlds (array of strings)
* drops (array of strings)

## Schema

```sql
CREATE TABLE IF NOT EXISTS enemies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    story_phase TEXT NOT NULL
        CHECK (story_phase IN ('Before_HB', 'After_HB')),
    hp INTEGER NOT NULL CHECK (hp >= 0),
    attack INTEGER NOT NULL CHECK (attack >= 0),
    defense INTEGER NOT NULL CHECK (defense >= 0),
    mp_recovery INTEGER NOT NULL CHECK (mp_recovery >= 0),
    exp INTEGER NOT NULL CHECK (exp >= 0),
    worlds TEXT NOT NULL,
    drops TEXT NOT NULL,
    UNIQUE (name, story_phase)
);
```

The `worlds` and `drops` attributes are stored as JSON text in SQLite and converted to arrays when returned by the API.

## REST Endpoints

| Name | Method | Path |
|---|---|---|
| Retrieve enemy collection | GET | `/enemies` |
| Retrieve enemy member | GET | `/enemies/<id>` |
| Create enemy member | POST | `/enemies` |
| Update enemy member | PUT | `/enemies/<id>` |
| Delete enemy member | DELETE | `/enemies/<id>` |

### Administrator Setup

Generate a Flask secret key:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Generate an administrator password hash:
```bash
python password.py
```

Set the environment variables in your terminal:
```bash
export FLASK_SECRET_KEY='your-generated-secret-key'
export ADMIN_PASSWORD_HASH='your-generated-password-hash'
```

These environment variables must be set again when opening a new terminal session.

## Administrator Endpoints

| Name | Method | Path |
|---|---|---|
| Administrator login | POST | `/admin/login` |
| Administrator logout | POST | `/admin/logout` |
| Check administrator status | GET | `/admin/status` |

Creating, updating, and deleting enemies requires administrator authentication. The administrator logs in using a password, and the server maintains the authenticated session using a session cookie.

## Running the Project

1. Create and activate a Python virtual environment.
2. Install the required Python dependencies.
3. Set the required environment variables:
   * `FLASK_SECRET_KEY`
   * `ADMIN_PASSWORD_HASH`
4. Start the Flask server.
5. Open `static/index.html` using VS Code Live Server.

The frontend communicates with the Flask API running at `http://127.0.0.1:5000`.