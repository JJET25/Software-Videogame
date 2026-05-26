CREATE DATABASE IF NOT EXISTS dimension_deck;
USE dimension_deck;

CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cards (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    card_name        VARCHAR(100) UNIQUE NOT NULL,
    card_type        ENUM('active','automatic') NOT NULL,
    subtype          VARCHAR(50),
    rarity           ENUM('common','uncommon','rare','epic','legendary') NOT NULL,
    base_damage      INT   DEFAULT 0,
    base_heal        INT   DEFAULT 0,
    cooldown_seconds FLOAT DEFAULT 0,
    effect_json      JSON,
    shop_cost        INT   DEFAULT 0,
    description      TEXT
);

CREATE TABLE IF NOT EXISTS runs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    started_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at        TIMESTAMP NULL,
    status          ENUM('active','victory','defeat') DEFAULT 'active',
    rooms_cleared   INT DEFAULT 0,
    enemies_killed  INT DEFAULT 0,
    damage_dealt    INT DEFAULT 0,
    damage_taken    INT DEFAULT 0,
    credits_earned  INT DEFAULT 0,
    cards_collected INT DEFAULT 0,
    score           INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS run_cards (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    run_id  INT NOT NULL,
    card_id INT NOT NULL,
    FOREIGN KEY (run_id)  REFERENCES runs(id)  ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Seed: 12 active + 6 automatic cards (matches CardCatalog.js)
INSERT IGNORE INTO cards (card_name, card_type, subtype, rarity, base_damage, base_heal, cooldown_seconds, effect_json, shop_cost, description) VALUES
-- Active – Melee
('Quick Strike',     'active', 'melee',   'common',    1000, 0,  3, '{"range":120,"spread":0.628}',                            0, 'Deal damage to enemies within 120px.'),
('Iron Fist',        'active', 'melee',   'rare',        55, 0,  5, '{"range":90,"spread":1.099}',                            50, 'A powerful close-range blow dealing 55 damage within 90px.'),
('Nova Burst',       'active', 'melee',   'epic',       110, 0,  9, '{"range":200,"spread":3.142}',                           80, 'Unleash an explosion dealing 110 damage to all enemies within 200px.'),
('Shadow Blade',     'active', 'melee',   'legendary',  180, 0, 15, '{"range":160,"spread":2.356}',                          130, 'A devastating strike dealing 180 damage to enemies within 160px.'),
-- Active – Heal
('Heal Pulse',       'active', 'heal',    'common',       0,25, 10, '{}',                                                      0, 'Restore 25 HP.'),
('Mending Wave',     'active', 'heal',    'epic',         0,70, 15, '{}',                                                     85, 'Release a healing wave that restores 70 HP.'),
('Phoenix Elixir',   'active', 'heal',    'legendary',    0, 0, 30, '{"full_heal":true}',                                    150, 'Consume a legendary elixir to fully restore all HP.'),
-- Active – Drain
('Blood Siphon',     'active', 'drain',   'rare',        40,20, 12, '{}',                                                     65, 'Drain the nearest enemy for 40 damage and restore 20 HP.'),
-- Active – Defense
('Wood Shield',      'active', 'defense', 'common',       0, 0,  8, '{"shield":20}',                                           0, 'Absorb the next 20 damage.'),
('Stone Wall',       'active', 'defense', 'rare',         0, 0, 12, '{"shield":50}',                                          60, 'Erect a wall of stone that absorbs the next 50 damage.'),
('Mirror Guard',     'active', 'defense', 'epic',         0, 0, 14, '{"shield":35,"invincibility":1.5}',                      90, 'Gain 35 shield and 1.5s of invincibility.'),
('Diamond Fortress', 'active', 'defense', 'legendary',    0, 0, 18, '{"shield":100}',                                        140, 'Crystallize your body, absorbing the next 100 damage.'),
-- Automatic
('Lifetap',          'automatic', 'heal',    'common',    0,20,  0, '{"trigger":"on_kill"}',                                  40, 'Restore 20 HP each time you kill an enemy.'),
('Iron Skin',        'automatic', 'defense', 'common',    0, 0,  0, '{"trigger":"on_attack","shield":8}',                     45, 'Gain 8 shield each time you hit an enemy.'),
('Rebound',          'automatic', 'melee',   'rare',     15, 0,  0, '{"trigger":"on_hit_received","range":150}',              65, 'When hit, deal 15 damage to enemies within 150px.'),
('Berserker Rush',   'automatic', 'melee',   'rare',     20, 0,  0, '{"trigger":"on_dash","range":100}',                      70, 'Dashing deals 20 damage to enemies within 100px.'),
('Last Stand',       'automatic', 'defense', 'epic',      0, 0,  0, '{"trigger":"on_hit_received","invincibility":2,"threshold":0.3}', 95, 'When hit below 30% HP, gain 2s of invincibility.'),
('Chain Kill',       'automatic', 'melee',   'epic',     25, 0,  0, '{"trigger":"on_kill","from_enemy":true,"range":200}',   100, 'Killing an enemy deals 25 damage to all others within 200px.');

-- ─────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────

-- Top 10 players ranked by best score
DROP VIEW IF EXISTS v_leaderboard;
CREATE VIEW v_leaderboard AS
SELECT
    u.id                          AS user_id,
    u.username,
    MAX(r.score)                  AS best_score,
    COUNT(r.id)                   AS total_runs,
    SUM(r.status = 'victory')     AS victories
FROM runs r
JOIN users u ON u.id = r.user_id
WHERE r.status != 'active'
GROUP BY u.id, u.username;

-- Per-user aggregate KPIs (one row per user, finished runs only)
DROP VIEW IF EXISTS v_user_run_summary;
CREATE VIEW v_user_run_summary AS
SELECT
    user_id,
    COUNT(*)                              AS total_runs,
    SUM(status = 'victory')               AS victories,
    SUM(status = 'defeat')                AS defeats,
    ROUND(AVG(status = 'victory') * 100, 1) AS win_rate_pct,
    MAX(score)                            AS best_score,
    ROUND(AVG(score), 0)                  AS avg_score,
    SUM(enemies_killed)                   AS total_enemies_killed,
    ROUND(AVG(enemies_killed), 1)         AS avg_enemies_per_run,
    SUM(rooms_cleared)                    AS total_rooms_cleared,
    ROUND(AVG(rooms_cleared), 1)          AS avg_rooms_per_run,
    SUM(damage_dealt)                     AS total_damage_dealt,
    SUM(damage_taken)                     AS total_damage_taken
FROM runs
WHERE status != 'active'
GROUP BY user_id;

-- Per-user, per-card collection counts
DROP VIEW IF EXISTS v_card_usage;
CREATE VIEW v_card_usage AS
SELECT
    r.user_id,
    c.id        AS card_id,
    c.card_name,
    c.rarity,
    c.card_type,
    c.subtype,
    COUNT(*)    AS times_collected
FROM run_cards rc
JOIN cards c ON c.id = rc.card_id
JOIN runs  r ON r.id = rc.run_id
GROUP BY r.user_id, c.id, c.card_name, c.rarity, c.card_type, c.subtype;

-- Global card popularity across all runs
DROP VIEW IF EXISTS v_top_cards;
CREATE VIEW v_top_cards AS
SELECT
    c.card_name,
    c.rarity,
    c.card_type,
    c.subtype,
    COUNT(*) AS times_collected
FROM run_cards rc
JOIN cards c ON c.id = rc.card_id
GROUP BY c.id, c.card_name, c.rarity, c.card_type, c.subtype;

-- Single-row global stats snapshot
DROP VIEW IF EXISTS v_global_stats;
CREATE VIEW v_global_stats AS
SELECT
    COUNT(DISTINCT user_id)               AS total_players,
    COUNT(*)                              AS total_runs,
    SUM(status = 'victory')               AS total_victories,
    ROUND(AVG(status = 'victory') * 100, 1) AS global_win_rate_pct,
    ROUND(AVG(score), 0)                  AS avg_score,
    MAX(score)                            AS record_score
FROM runs
WHERE status != 'active';
