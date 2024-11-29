INSERT INTO users (id, name, email, username, password, role, phone, status, created_at, last_update)
VALUES 
('836f82db99121b3481011f16b49dfa5fbc714a0d1b1b9f784a1ebbbf5b39577f', 'John Doe', 'john.doe@example.com', 'johndoe', 'password123', 'admin', '1234567890', 'active', NOW(), NOW()),
('f2d1f1c853fd1f4be1eb5060eaae93066c877d069473795e31db5e70c4880859', 'Jane Smith', 'jane.smith@example.com', 'janesmith', 'password456', 'user', '0987654321', 'active', NOW(), NOW()),
('a50e5aca9ac28948220d9c3103b14084edac7141f62d8aaa0d89e3bf1adc0993', 'Bob Johnson', 'brand@example.com', 'bobjohnson', '123', 'brand', '1122334455', 'active', NOW(), NOW());