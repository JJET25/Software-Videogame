USE dimension_deck;

-- Test data: 11 users, 10 runs, 10 run cards.
-- All users share password "123" (bcrypt hash below).
-- Session variables are used to avoid relying on exact AUTO_INCREMENT values.
-- Triggers handle run_player_state, cards_collected, and run_log automatically.

-- 11 test users (1 admin + 10 players), all with password "123"
INSERT IGNORE INTO users (username, email, password_hash, is_admin) VALUES
('Admin',        'admin@dimensiondeck.com',  '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 1),
('player_one',   'player_one@test.com',      '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 0),
('shadowhunter', 'shadowhunter@test.com',    '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 0),
('darkknightz',  'darkknightz@test.com',     '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 0),
('arcane_mage',  'arcane_mage@test.com',     '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 0),
('swift_blade',  'swift_blade@test.com',     '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 0),
('iron_warrior', 'iron_warrior@test.com',    '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 0),
('void_walker',  'void_walker@test.com',     '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 0),
('star_lord99',  'star_lord99@test.com',     '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 0),
('neon_rider',   'neon_rider@test.com',      '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 0),
('cyber_witch',  'cyber_witch@test.com',     '$2b$10$4QNZQSIq9FJkaoI0NfjVJuCnrUcxuMfueO28Nx0mK2scirgRJneKe', 0);

-- Load user IDs by username
SET @u_player    = (SELECT id FROM users WHERE username = 'player_one');
SET @u_shadow    = (SELECT id FROM users WHERE username = 'shadowhunter');
SET @u_dark      = (SELECT id FROM users WHERE username = 'darkknightz');
SET @u_arcane    = (SELECT id FROM users WHERE username = 'arcane_mage');
SET @u_swift     = (SELECT id FROM users WHERE username = 'swift_blade');
SET @u_iron      = (SELECT id FROM users WHERE username = 'iron_warrior');
SET @u_void      = (SELECT id FROM users WHERE username = 'void_walker');
SET @u_star      = (SELECT id FROM users WHERE username = 'star_lord99');
SET @u_neon      = (SELECT id FROM users WHERE username = 'neon_rider');
SET @u_cyber     = (SELECT id FROM users WHERE username = 'cyber_witch');

-- 10 runs inserted one at a time to capture each LAST_INSERT_ID

-- player_one, victory
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_player, 'victory', 1850,  8, 42, 3200,  850, 400, 0,
        '2026-06-07 10:00:00', '2026-06-07 10:35:00');
SET @r_a = LAST_INSERT_ID();

-- player_one, defeat
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_player, 'defeat', 620, 3, 18, 1100, 980, 150, 0,
        '2026-06-08 14:00:00', '2026-06-08 14:12:00');
SET @r_b = LAST_INSERT_ID();

-- shadowhunter, victory, highest score in this batch
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_shadow, 'victory', 2300, 10, 55, 4100, 600, 500, 0,
        '2026-06-06 09:00:00', '2026-06-06 09:50:00');
SET @r_c = LAST_INSERT_ID();

-- darkknightz, defeat
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_dark, 'defeat', 310, 2, 10, 600, 1200, 80, 0,
        '2026-06-05 16:00:00', '2026-06-05 16:08:00');
SET @r_d = LAST_INSERT_ID();

-- arcane_mage, defeat
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_arcane, 'defeat', 540, 3, 14, 900, 1100, 120, 0,
        '2026-06-04 20:00:00', '2026-06-04 20:10:00');
SET @r_e = LAST_INSERT_ID();

-- swift_blade, victory
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_swift, 'victory', 1620, 7, 38, 2800, 720, 360, 0,
        '2026-06-08 11:00:00', '2026-06-08 11:30:00');
SET @r_f = LAST_INSERT_ID();

-- iron_warrior, defeat
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_iron, 'defeat', 780, 4, 22, 1400, 1050, 180, 0,
        '2026-06-07 18:00:00', '2026-06-07 18:18:00');
SET @r_g = LAST_INSERT_ID();

-- void_walker, victory
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_void, 'victory', 1200, 5, 29, 2100, 950, 280, 0,
        '2026-06-06 20:00:00', '2026-06-06 20:22:00');
SET @r_h = LAST_INSERT_ID();

-- star_lord99, currently active
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_star, 'active', 0, 0, 0, 0, 0, 0, 0,
        '2026-06-09 11:55:00', NULL);
SET @r_i = LAST_INSERT_ID();

-- neon_rider, currently active
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_neon, 'active', 0, 0, 0, 0, 0, 0, 0,
        '2026-06-09 12:05:00', NULL);
SET @r_j = LAST_INSERT_ID();

-- 10 run cards
-- trg_cards_collected_count increments runs.cards_collected and writes to run_log per row

INSERT INTO run_cards (run_id, card_id, slot) VALUES
-- run A: player_one victory
(@r_a,  1, 'active'),
(@r_a, 13, 'automatic'),
-- run B: player_one defeat
(@r_b,  5, 'active'),
-- run C: shadowhunter victory
(@r_c,  4, 'active'),
(@r_c, 11, 'active'),
(@r_c, 18, 'automatic'),
-- run F: swift_blade victory
(@r_f,  9, 'active'),
(@r_f, 15, 'automatic'),
-- run G: iron_warrior defeat
(@r_g, 21, 'automatic'),
-- run I: star_lord99 active
(@r_i, 14, 'automatic');
