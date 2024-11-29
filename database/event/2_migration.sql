-- Xóa bảng nếu đã tồn tại
DROP TABLE IF EXISTS participation;

-- Tạo bảng 'participation'
CREATE TABLE IF NOT EXISTS participation (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    brand_id VARCHAR,
    user_id VARCHAR,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
