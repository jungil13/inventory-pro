-- USERS
INSERT INTO users (id, name, email, role, avatar_url, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'John Admin', 'admin@inventorypro.com', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '2026-08-01T08:00:00Z', '2026-08-01T08:00:00Z'),
('22222222-2222-2222-2222-222222222222', 'Maria Santos', 'maria@inventorypro.com', 'manager', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '2026-08-02T09:00:00Z', '2026-08-02T09:00:00Z'),
('33333333-3333-3333-3333-333333333333', 'Mike Rivera', 'mike@inventorypro.com', 'staff', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '2026-08-03T10:00:00Z', '2026-08-03T10:00:00Z');


-- SYSTEM SETTINGS
INSERT INTO system_settings (id, company_name, currency, allow_negative_stock, low_stock_global_threshold, beep_sound_enabled, beep_volume, scanner_debounce_ms) VALUES
(1, 'Metro Logistics & Retail Enterprise', 'PHP', false, 10, true, 0.5, 300);
