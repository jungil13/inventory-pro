-- USERS
INSERT INTO users (id, name, email, role, avatar_url, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'John Admin', 'admin@inventorypro.com', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '2026-08-01T08:00:00Z', '2026-08-01T08:00:00Z'),
('22222222-2222-2222-2222-222222222222', 'Maria Santos', 'maria@inventorypro.com', 'manager', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '2026-08-02T09:00:00Z', '2026-08-02T09:00:00Z'),
('33333333-3333-3333-3333-333333333333', 'Mike Rivera', 'mike@inventorypro.com', 'staff', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '2026-08-03T10:00:00Z', '2026-08-03T10:00:00Z');

-- CATEGORIES
INSERT INTO categories (id, name, description, color, created_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'Beverages', 'Soft drinks, juices, mineral water, and energy drinks', '#3b82f6', '2026-08-01T08:00:00Z'),
('c2222222-2222-2222-2222-222222222222', 'Food & Snacks', 'Instant noodles, snacks, canned goods, condiments', '#f59e0b', '2026-08-01T08:00:00Z'),
('c3333333-3333-3333-3333-333333333333', 'Electronics', 'Cables, peripherals, computer accessories', '#8b5cf6', '2026-08-01T08:00:00Z'),
('c4444444-4444-4444-4444-444444444444', 'Office Supplies', 'Paper, writing instruments, desk essentials', '#10b981', '2026-08-01T08:00:00Z'),
('c5555555-5555-5555-5555-555555555555', 'Cleaning Supplies', 'Detergents, disinfectants, wiping cloths', '#ec4899', '2026-08-01T08:00:00Z');

-- SUPPLIERS
INSERT INTO suppliers (id, name, contact_person, phone, email, address, notes, created_at, updated_at) VALUES
('51111111-1111-1111-1111-111111111111', 'ABC Trading & Distribution Corp', 'Carlos Mendoza', '+63 917 555 0101', 'carlos@abctrading.ph', '128 Warehouse Row, Pasig City, Metro Manila', 'Primary beverage and FMCG supplier. Standard delivery 2 days.', '2026-08-01T08:00:00Z', '2026-08-01T08:00:00Z'),
('52222222-2222-2222-2222-222222222222', 'Universal Food Mega Distro', 'Elena Cruz', '+63 920 555 0202', 'elena@universalfood.ph', '45 North Harbor Logistics Hub, Tondo, Manila', 'Food, noodles, and packaged goods distributor.', '2026-08-01T08:00:00Z', '2026-08-01T08:00:00Z'),
('53333333-3333-3333-3333-333333333333', 'TechParts Asia Solutions', 'David Lee', '+63 918 555 0303', 'sales@techpartsasia.com', 'Unit 802 Tech Plaza, Makati City', 'Cables, adapters, electronics.', '2026-08-01T08:00:00Z', '2026-08-01T08:00:00Z'),
('54444444-4444-4444-4444-444444444444', 'Paper & Office Essentials Inc', 'Grace Tan', '+63 919 555 0404', 'gtan@paperoffice.ph', '88 Commercial Ave, Quezon City', 'Paper reams, office stationery supplies.', '2026-08-01T08:00:00Z', '2026-08-01T08:00:00Z');

-- PRODUCTS
INSERT INTO products (id, name, sku, barcode, description, brand, category_id, supplier_id, cost_price, selling_price, minimum_stock, maximum_stock, unit, image_url, location, status, created_at, updated_at) VALUES
('71111111-1111-1111-1111-111111111111', 'Coca-Cola 1.5L', 'COKE-15L', '4801234567890', 'Refreshing Coca-Cola Original Taste 1.5 Liter PET Bottle', 'Coca-Cola', 'c1111111-1111-1111-1111-111111111111', '51111111-1111-1111-1111-111111111111', 65.0, 85.0, 10, 100, 'bottles', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', 'Aisle 1, Rack B-01', 'active', '2026-08-20T08:00:00Z', '2026-08-24T08:00:00Z'),
('72222222-2222-2222-2222-222222222222', 'Pepsi 1.5L', 'PEPSI-15L', '4801234567891', 'Pepsi Cola Refreshing Soda 1.5 Liter Bottle', 'PepsiCo', 'c1111111-1111-1111-1111-111111111111', '51111111-1111-1111-1111-111111111111', 60.0, 80.0, 15, 100, 'bottles', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500', 'Aisle 1, Rack B-02', 'active', '2026-08-20T08:30:00Z', '2026-08-24T09:15:00Z'),
('73333333-3333-3333-3333-333333333333', 'Lucky Me! Pancit Canton Original 80g', 'LM-PC-ORIG-80G', '4801234567892', 'Instant fried noodles with savory original seasoning flavor', 'Monde Nissin', 'c2222222-2222-2222-2222-222222222222', '52222222-2222-2222-2222-222222222222', 14.5, 19.0, 50, 300, 'packs', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500', 'Aisle 2, Bin C-05', 'active', '2026-08-21T09:00:00Z', '2026-08-21T09:00:00Z'),
('74444444-4444-4444-4444-444444444444', 'Braided USB Type-C Fast Charging Cable 1.5m', 'CBL-USBC-15M', '4801234567893', 'Durable nylon braided 60W Power Delivery USB-C to USB-C charging cable', 'VoltLink', 'c3333333-3333-3333-3333-333333333333', '53333333-3333-3333-3333-333333333333', 110.0, 220.0, 8, 50, 'pcs', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500', 'Electronics Cabinet E-01', 'active', '2026-08-22T10:00:00Z', '2026-08-24T12:00:00Z'),
('75555555-5555-5555-5555-555555555555', 'Ultra White A4 Copier Bond Paper (70gsm, 500 Sheets)', 'PAP-A4-70GSM', '4801234567894', 'Premium smooth copy paper for laser and inkjet printing, 500 sheets ream', 'PaperPro', 'c4444444-4444-4444-4444-444444444444', '54444444-4444-4444-4444-444444444444', 180.0, 260.0, 20, 150, 'reams', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500', 'Warehouse Storage Rack D-04', 'active', '2026-08-23T11:00:00Z', '2026-08-23T11:00:00Z');

-- INVENTORY
INSERT INTO inventory (product_id, quantity) VALUES
('71111111-1111-1111-1111-111111111111', 25),
('72222222-2222-2222-2222-222222222222', 12),
('73333333-3333-3333-3333-333333333333', 140),
('74444444-4444-4444-4444-444444444444', 4),
('75555555-5555-5555-5555-555555555555', 45);

-- STOCK MOVEMENTS
INSERT INTO stock_movements (id, product_id, type, quantity, previous_quantity, new_quantity, reason, reference, supplier_id, user_id, notes, created_at) VALUES
('81111111-1111-1111-1111-111111111111', '71111111-1111-1111-1111-111111111111', 'stock_in', 50, 0, 50, 'Initial Stock Delivery', 'PO-2026-001', '51111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Delivered intact by ABC Trading truck', NOW() - INTERVAL '3 days'),
('82222222-2222-2222-2222-222222222222', '71111111-1111-1111-1111-111111111111', 'stock_out', 25, 50, 25, 'Customer Retail Sales', 'SALES-2026-88', NULL, '33333333-3333-3333-3333-333333333333', 'Dispatched to retail display chiller', NOW() - INTERVAL '1 day'),
('83333333-3333-3333-3333-333333333333', '72222222-2222-2222-2222-222222222222', 'stock_in', 20, 0, 20, 'New Batch Stock In', 'PO-2026-004', '51111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Standard delivery verified', NOW() - INTERVAL '2 days'),
('84444444-4444-4444-4444-444444444444', '72222222-2222-2222-2222-222222222222', 'stock_out', 8, 20, 12, 'Store Floor Transfer', 'SO-2026-012', NULL, '33333333-3333-3333-3333-333333333333', 'Transferred to beverage cooler', NOW() - INTERVAL '4 hours'),
('85555555-5555-5555-5555-555555555555', '74444444-4444-4444-4444-444444444444', 'adjustment', -2, 6, 4, 'Damaged Items (Crushed box in transit)', NULL, NULL, '11111111-1111-1111-1111-111111111111', 'Defective connector discovered during cycle count', NOW() - INTERVAL '1 hour');

-- AUDIT LOGS
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_data, old_data, created_at) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'STOCK_IN', 'inventory', '71111111-1111-1111-1111-111111111111', '{"quantity": 50, "reference": "PO-2026-001"}', NULL, NOW() - INTERVAL '3 days'),
('a2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'STOCK_OUT', 'inventory', '71111111-1111-1111-1111-111111111111', '{"quantity": 25, "reference": "SALES-2026-88"}', NULL, NOW() - INTERVAL '1 day'),
('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'STOCK_ADJUSTMENT', 'inventory', '74444444-4444-4444-4444-444444444444', '{"quantity": 4, "difference": -2, "reason": "Damaged Items"}', '{"quantity": 6}', NOW() - INTERVAL '1 hour');

-- SYSTEM SETTINGS
INSERT INTO system_settings (id, company_name, currency, allow_negative_stock, low_stock_global_threshold, beep_sound_enabled, beep_volume, scanner_debounce_ms) VALUES
(1, 'Metro Logistics & Retail Enterprise', 'PHP', false, 10, true, 0.5, 300);
