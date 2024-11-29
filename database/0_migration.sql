DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS game_types;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS voucher_templates;
DROP TABLE IF EXISTS favorite_events;


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    email VARCHAR,
    username VARCHAR,
    password VARCHAR,
    role VARCHAR,
    phone VARCHAR,
    created_at TIMESTAMP,
    status VARCHAR,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    name VARCHAR,
    domain VARCHAR,
    address VARCHAR,
    latitude VARCHAR,
    longitude VARCHAR,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    poster VARCHAR,
    name VARCHAR,
    description VARCHAR,
    start_time TIME,
    end_time TIME,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voucher_templates (
    id SERIAL PRIMARY KEY,
    image VARCHAR,
    value FLOAT,
    description VARCHAR,
    status VARCHAR,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    poster VARCHAR,
    name VARCHAR,
    game_type_id INTEGER REFERENCES game_types(id),
    game_data_id INTEGER,
    tradable BOOLEAN,
    description VARCHAR,
    amount INTEGER,
    voucher_template_id INTEGER REFERENCES voucher_templates(id),
    start_time TIME,
    end_time TIME,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS vouchers (
    code VARCHAR PRIMARY KEY,
    voucher_template_id INTEGER REFERENCES voucher_templates(id),
    qr VARCHAR,
    expiry_date TIMESTAMP,
    status VARCHAR,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS favorite_events (
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    PRIMARY KEY (user_id, event_id),
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);