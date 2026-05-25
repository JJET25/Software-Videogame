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
    rarity           ENUM('common','uncommon','rare') NOT NULL,
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

-- Seed: 12 active + 6 automatic cards
INSERT IGNORE INTO cards (card_name, card_type, subtype, rarity, base_damage, base_heal, cooldown_seconds, effect_json, shop_cost, description) VALUES
-- Active – Melee
('Quick Strike',    'active', 'melee',   'common',   200,  0,  3, '{"range":120}',                           0,  'Deal 200 damage to enemies within 120px.'),
('Dual Strike',     'active', 'melee',   'common',   120,  0,  4, '{"range":100,"hits":2}',                 30,  'Hit twice for 120 damage each within 100px.'),
('Heavy Blow',      'active', 'melee',   'uncommon', 350,  0,  6, '{"range":80}',                           50,  'Deal 350 damage in a short range.'),
('Whirlwind Slash', 'active', 'melee',   'uncommon', 200,  0,  8, '{"range":160,"aoe":true}',               60,  'Slash all enemies within 160px.'),
-- Active – Heal
('Heal Pulse',      'active', 'heal',    'common',     0, 25, 10, '{}',                                      0,  'Restore 25 HP.'),
('Mend',            'active', 'heal',    'common',     0, 40, 12, '{}',                                     35,  'Restore 40 HP.'),
('Rejuvenation',    'active', 'heal',    'uncommon',   0, 60, 18, '{"dot":true,"ticks":3}',                 55,  'Restore 60 HP over 3 ticks.'),
('Vital Surge',     'active', 'heal',    'rare',       0,100, 22, '{}',                                     80,  'Restore 100 HP instantly.'),
-- Active – Defense
('Wood Shield',     'active', 'defense', 'common',     0,  0,  8, '{"shield":20}',                           0,  'Absorb the next 20 damage.'),
('Iron Wall',       'active', 'defense', 'uncommon',   0,  0, 12, '{"shield":50}',                          60,  'Absorb the next 50 damage.'),
('Arcane Shield',   'active', 'defense', 'uncommon',   0,  0, 10, '{"shield":35}',                          55,  'Absorb the next 35 damage.'),
('Bone Armour',     'active', 'defense', 'rare',       0,  0, 15, '{"shield":75}',                          75,  'Absorb the next 75 damage.'),
-- Automatic
('Counter Slash',   'automatic', 'melee', 'common',   80,  0,  0, '{"trigger":"on_hit_received"}',          40,  'On hit received: deal 80 damage back.'),
('Thorns',          'automatic', 'melee', 'common',   50,  0,  0, '{"trigger":"on_hit_received"}',          35,  'On hit received: reflect 50 damage.'),
('Vampiric Touch',  'automatic', 'drain', 'uncommon',  0, 30,  0, '{"trigger":"on_kill"}',                  65,  'On kill: restore 30 HP.'),
('Soul Drain',      'automatic', 'drain', 'uncommon', 60, 10,  0, '{"trigger":"on_attack"}',                70,  'On attack: deal 60 damage and heal 10 HP.'),
('Adrenaline Rush', 'automatic', 'melee', 'rare',    150,  0,  0, '{"trigger":"on_low_health","threshold":0.3}', 90, 'When below 30% HP: burst for 150 damage.'),
('Life Link',       'automatic', 'heal',  'rare',      0,  0,  0, '{"trigger":"on_attack","heal_pct":0.15}',85,  'On attack: heal 15% of damage dealt.');

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
