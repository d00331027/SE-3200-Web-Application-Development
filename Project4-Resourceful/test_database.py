from database import EnemyDatabase
import json

db = EnemyDatabase()

enemy = {"name": "Air Pirate",
         "description": "Winged Heartless that mostly appear in Neverland. They are extremely combative and are hardly ever caught off guard. They attack with martial-arts-like techniques.",
         "story_phase": "Before_HB",
         "hp": 120,
         "attack": 27,
         "defense": 21,
         "mp_recovery": 38,
         "exp": 40,
         "worlds": ["Neverland", "Monstro"],
         "drops": ["Hi-Potion", "Mega-Potion", "Power Gem"]
        }

connection = db.get_connection()

cursor = connection.execute("""
    INSERT INTO enemies (
        name, description, story_phase, hp, attack,
        defense, mp_recovery, exp, worlds, drops
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    enemy["name"],
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

connection.commit()
connection.close()

enemies = db.get_all_enemies()
print(enemies)