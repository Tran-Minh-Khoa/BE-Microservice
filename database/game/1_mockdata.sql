-- Xóa các dữ liệu cũ nếu tồn tại
TRUNCATE TABLE game_type RESTART IDENTITY CASCADE;
TRUNCATE TABLE game RESTART IDENTITY CASCADE;

-- Thêm dữ liệu mẫu cho bảng game
DO $$
BEGIN
    FOR i IN 1..50 LOOP
        INSERT INTO game (
            brand_id,
            event_id,
            poster,
            name,
            game_type_id,
            game_data_id,
            tradable,
            description,
            amount,
            voucher_template_id,
            start_time,
            end_time,
            created_at,
            updated_at
        ) VALUES (
            'a50e5aca9ac28948220d9c3103b14084edac7141f62d8aaa0d89e3bf1adc0993',  -- brand_id ngẫu nhiên từ 1 đến 5
            (SELECT FLOOR(RANDOM() * 50 + 1)::INTEGER), -- event_id ngẫu nhiên từ 1 đến 50
            CONCAT('https://picsum.photos/seed/picsum', i, '/500/300'),  -- poster URL
            CONCAT('Game ', i),  -- tên game
            1,
            (SELECT FLOOR(RANDOM() * 100 + 1)::INTEGER), -- game_data_id ngẫu nhiên từ 1 đến 100
            (SELECT RANDOM() < 0.5), -- tradable (TRUE hoặc FALSE)
            CONCAT('This is the description for game number ', i),  -- mô tả
            (SELECT FLOOR(RANDOM() * 1000 + 1)::INTEGER), -- số lượng
            (SELECT FLOOR(RANDOM() * 10 + 1)::INTEGER), -- voucher_template_id ngẫu nhiên từ 1 đến 10
            NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 10 + 1), -- start_time ngẫu nhiên
            NOW() + INTERVAL '1 day' * FLOOR(RANDOM() * 10 + 1), -- end_time ngẫu nhiên
            NOW(),  -- created_at: current timestamp
            NOW()  -- updated_at: current timestamp
        );
    END LOOP;
END $$;

INSERT INTO game_type (id, name, created_at, updated_at)
VALUES (1, 'Quiz', NOW(), NOW());

INSERT INTO game_type (id, name, created_at, updated_at)
VALUES (2, 'Gacha', NOW(), NOW());

