DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS game_type;

CREATE TABLE IF NOT EXISTS game_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game (
    id SERIAL PRIMARY KEY,
    brand_id VARCHAR(100),
    event_id INTEGER,
    poster VARCHAR,
    name VARCHAR,
    game_type_id INTEGER,
    game_data_id VARCHAR,
    tradable BOOLEAN,
    description VARCHAR,
    amount INTEGER,
    voucher_template_id INTEGER,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);