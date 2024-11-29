DO $$
BEGIN
    FOR i IN 1..150 LOOP
        INSERT INTO participation (
            event_id, 
            brand_id, 
            user_id, 
            created_date
        ) VALUES (
            -- Chọn event_id ngẫu nhiên từ 1 đến 50
            (SELECT FLOOR(RANDOM() * 50 + 1)::INTEGER),
            -- Chọn brand_id ngẫu nhiên từ 1 đến 5
            'a50e5aca9ac28948220d9c3103b14084edac7141f62d8aaa0d89e3bf1adc0993',
            -- Chọn user_id ngẫu nhiên từ 1 đến 100
            (SELECT FLOOR(RANDOM() * 100 + 1)::INTEGER),
            -- Thời gian tạo ngẫu nhiên trong khoảng thời gian hiện tại
            NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30 + 1)
        );
    END LOOP;
END $$;
