DROP TABLE IF EXISTS event;

CREATE TABLE IF NOT EXISTS event (
    id SERIAL PRIMARY KEY,
    brand_id VARCHAR,
    poster VARCHAR,
    name VARCHAR,
    description VARCHAR,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);