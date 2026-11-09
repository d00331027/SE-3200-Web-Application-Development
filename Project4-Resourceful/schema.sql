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
