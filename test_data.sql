-- Insert test categories
INSERT INTO categories (name, description) VALUES
('竹制家具', '各种竹制家具，包括椅子、桌子、床等'),
('竹制餐具', '竹制碗、筷子、勺子等餐具'),
('竹制工艺品', '竹制装饰品、摆件等工艺品'),
('竹制日用品', '竹制收纳盒、衣架等日用品');

-- Insert test products
INSERT INTO products (name, description, price, stock, image, category_id) VALUES
('竹制餐桌', '天然竹材制作，环保耐用', 899.00, 50, 'https://example.com/images/table.jpg', 1),
('竹制餐椅', '舒适耐用，承重能力强', 299.00, 100, 'https://example.com/images/chair.jpg', 1),
('竹制筷子', '天然竹材，无漆无蜡', 29.90, 200, 'https://example.com/images/chopsticks.jpg', 2),
('竹制碗', '天然竹材，防烫隔热', 49.90, 150, 'https://example.com/images/bowl.jpg', 2),
('竹制笔筒', '简约设计，实用美观', 39.90, 80, 'https://example.com/images/penholder.jpg', 3),
('竹制收纳盒', '多格设计，收纳方便', 59.90, 120, 'https://example.com/images/storage.jpg', 4);

-- Insert test users
INSERT INTO users (openid, nickname, avatar, phone) VALUES
('wx123456789', '张三', 'https://example.com/avatars/user1.jpg', '13800138000'),
('wx987654321', '李四', 'https://example.com/avatars/user2.jpg', '13900139000');

-- Insert test orders
INSERT INTO orders (user_id, total_amount, status, address, contact, phone) VALUES
(1, 1197.00, 'completed', '北京市朝阳区xxx街道', '张三', '13800138000'),
(2, 89.80, 'pending', '上海市浦东新区xxx路', '李四', '13900139000');

-- Insert test order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 899.00),
(1, 2, 1, 299.00),
(2, 3, 2, 29.90),
(2, 4, 1, 29.90);

-- Insert test footprints
INSERT INTO footprints (user_id, product_id) VALUES
(1, 1),
(1, 3),
(2, 2),
(2, 4);

-- Insert test favorites
INSERT INTO favorites (user_id, product_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4); 