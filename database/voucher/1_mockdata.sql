-- Insert mock data into vouchertemplates table
INSERT INTO vouchertemplates (name, image, value, description, status, brand_id, created_at, updated_at) VALUES
('Voucher Template 1', 'image_1.jpg', 17.65, 'Description for voucher template 1', 'active', 'a50e5aca9ac28948220d9c3103b14084edac7141f62d8aaa0d89e3bf1adc0993', '2023-07-18', '2023-07-26'),
('Voucher Template 2', 'image_2.jpg', 72.48, 'Description for voucher template 2', 'inactive', 'a50e5aca9ac28948220d9c3103b14084edac7141f62d8aaa0d89e3bf1adc0993', '2023-01-16', '2023-05-24'),
('Voucher Template 3', 'image_3.jpg', 65.91, 'Description for voucher template 3', 'active', 'a50e5aca9ac28948220d9c3103b14084edac7141f62d8aaa0d89e3bf1adc0993', '2023-06-15', '2023-12-23'),
('Voucher Template 4', 'image_4.jpg', 50.11, 'Description for voucher template 4', 'active', 'a50e5aca9ac28948220d9c3103b14084edac7141f62d8aaa0d89e3bf1adc0993', '2023-09-23', '2023-11-15');

-- Insert mock data into vouchers table
INSERT INTO vouchers (user_id, qr, status, voucher_template_id, event_id, game_id, expire, created_at, updated_at) VALUES
('836f82db99121b3481011f16b49dfa5fbc714a0d1b1b9f784a1ebbbf5b39577f', 'qr_code_1', 'unused', 1, 2, 3, '2024-01-11', '2023-07-15', '2023-11-25'),
('836f82db99121b3481011f16b49dfa5fbc714a0d1b1b9f784a1ebbbf5b39577f', 'qr_code_2', 'used', 2, 3, 5, '2024-04-05', '2023-08-25', '2023-11-10'),
('836f82db99121b3481011f16b49dfa5fbc714a0d1b1b9f784a1ebbbf5b39577f', 'qr_code_3', 'used', 3, 1, 7, '2024-06-15', '2023-09-22', '2023-10-01');
