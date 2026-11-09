import json
import sqlite3
from pathlib import Path

class EnemyDatabase:
    def __init__(self, db_path="enemies.db"):
        self.db_path = db_path
        self.initialize_database()

    def get_connection(self):
        # Connect to a database
        connection = sqlite3.connect(self.db_path)

        # Changes the query result format from standard, index-only Python tuples to dictionary-like objects.
        # By adding sqlite3.Row, you can access the data using the actual database column names (e.g., row['health'], row['enemy_name']).
        connection.row_factory = sqlite3.Row

        return connection

    def initialize_database(self):
        # Locate schema.sql in the same directory as this file.
        schema_path = Path(__file__).parent / "schema.sql"

        # Read the SQL statements from the file.
        with open(schema_path, "r", encoding="utf-8") as schema_file:
            schema = schema_file.read()

        # Execute the schema against the database.
        connection = self.get_connection()

        try:
            # executescript() Parses and executes multiple SQL statements separated by semicolons in a single call.
            connection.executescript(schema)
        finally:
            connection.close()

    def get_all_enemies(self):
        # List: returns a JSON representation of the collection’s members.
        connection = self.get_connection()
        
        try:
            query = """
            SELECT * FROM enemies
            ORDER BY name,
            CASE story_phase
            WHEN 'Before_HB' THEN 1
            WHEN 'After_HB' THEN 2
            END;"""
            
            # execute() Executes a single SQL statement at a time.
            cursor = connection.execute(query)

            rows = cursor.fetchall() # Retrieves all rows resulting from a query.

            enemies = []

            for row in rows:
                enemy = dict(row) # convert each SQLite row into a regular Python dictionary.

                # Convert JSON text into a Python lists
                enemy["worlds"] = json.loads(enemy["worlds"])
                enemy["drops"] = json.loads(enemy["drops"])

                enemies.append(enemy)

            return enemies

        finally:
            connection.close()

    def get_enemy(self, enemy_id):
        # Retrieve: returns a JSON representation of a single member in the collection, as specified by the unique identifier given as a path parameter.
        connection = self.get_connection()

        try:
            cursor = connection.execute("SELECT * FROM enemies WHERE id = ?", (enemy_id,))

            row = cursor.fetchone()

            if row is None:
                # Returning None when an enemy doesn't exist will make it easier for Flask to return a 404 Not Found response.
                return None

            enemy = dict(row)
            enemy["worlds"] = json.loads(enemy["worlds"])
            enemy["drops"] = json.loads(enemy["drops"])

            return enemy
        
        finally:
            connection.close()

    def add_enemy(self, enemy):
        # Create: creates a new member within the collection, as specificed by the data parameters given in the request body.
        connection = self.get_connection()
        
        try:
            cursor = connection.execute("""
            INSERT INTO enemies (
            name, description, story_phase, hp, attack, 
            defense, mp_recovery, exp, worlds, drops
            )
            
            VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (enemy["name"],
             enemy["description"],
             enemy["story_phase"],
             enemy["hp"],
             enemy["attack"],
             enemy["defense"],
             enemy["mp_recovery"],
             enemy["exp"],
             json.dumps(enemy["worlds"]),
             json.dumps(enemy["drops"])
            ))
            
            # Used to permanently save data modifications (inserts, updates, deletes) to the database
            connection.commit()

            # Return the new enemy's ID
            return cursor.lastrowid
        
        finally:
            connection.close()

    def update_enemy(self, enemy_id, enemy):
        # Replace: updates an existing member in the collection, as specified by the unique identifier given as a path parameter, 
        # and by the data parameters given in the request body.
        connection = self.get_connection()

        try:
            cursor = connection.execute("""UPDATE enemies
            SET name = ?,
            description = ?,
            story_phase = ?,
            hp = ?,
            attack = ?,
            defense = ?,
            mp_recovery = ?,
            exp = ?,
            worlds = ?,
            drops = ?
            
            WHERE id = ?""", 
            (
                enemy["name"],
                enemy["description"],
                enemy["story_phase"],
                enemy["hp"],
                enemy["attack"],
                enemy["defense"],
                enemy["mp_recovery"],
                enemy["exp"],
                json.dumps(enemy["worlds"]),
                json.dumps(enemy["drops"]),
                enemy_id
            ))
            
            connection.commit()

            # cursor.rowcount returns the number of rows affected by an INSERT, UPDATE, or DELETE statement
            # Returns True if an enemy was updated, False if the specified ID doesn't exist.
            return cursor.rowcount > 0
        
        finally:
            connection.close()

    def delete_enemy(self, enemy_id):
        # Delete: removes an existing member from the collection, as specified by the unique identifier given as a path parameter.
        connection = self.get_connection()

        try:
            cursor = connection.execute("DELETE FROM enemies WHERE id=?", (enemy_id,))

            connection.commit()

            # Return True if an enemy was deleted, False if the ID does not exist
            return cursor.rowcount > 0

        finally:
            connection.close()