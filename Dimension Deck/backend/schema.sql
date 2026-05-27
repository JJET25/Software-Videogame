USE dimension_deck;

SET foreign_key_checks = 0;
DROP TABLE IF EXISTS run_cards;
DROP TABLE IF EXISTS card_effect_params;
DROP TABLE IF EXISTS runs;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS card_subtypes;
DROP TABLE IF EXISTS rarities;
DROP TABLE IF EXISTS users;
SET foreign_key_checks = 1;

CREATE TABLE rarities (
    id            INT         AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(20) UNIQUE NOT NULL,
    display_order INT         NOT NULL DEFAULT 0
);

CREATE TABLE card_subtypes (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    card_type ENUM('active', 'automatic') NOT NULL,
    subtype   VARCHAR(50) NOT NULL,
    UNIQUE KEY uq_type_sub (card_type, subtype)
);

CREATE TABLE users (
    id            INT          AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cards (
    id               INT          AUTO_INCREMENT PRIMARY KEY,
    card_name        VARCHAR(100) UNIQUE NOT NULL,
    subtype_id       INT NOT NULL,
    rarity_id        INT NOT NULL,
    base_damage      INT   DEFAULT 0,
    base_heal        INT   DEFAULT 0,
    cooldown_seconds FLOAT DEFAULT 0,
    shop_cost        INT   DEFAULT 0,
    description      TEXT,
    FOREIGN KEY (subtype_id) REFERENCES card_subtypes (id),
    FOREIGN KEY (rarity_id)  REFERENCES rarities (id)
);

CREATE TABLE card_effect_params (
    card_id       INT         PRIMARY KEY,
    effect_range  INT         DEFAULT NULL,
    spread        FLOAT       DEFAULT NULL,
    shield        INT         DEFAULT NULL,
    invincibility FLOAT       DEFAULT NULL,
    trigger_event VARCHAR(50) DEFAULT NULL,
    threshold     FLOAT       DEFAULT NULL,
    heal_pct      FLOAT       DEFAULT NULL,
    full_heal     TINYINT(1)  DEFAULT 0,
    from_enemy    TINYINT(1)  DEFAULT 0,
    FOREIGN KEY (card_id) REFERENCES cards (id) ON DELETE CASCADE
);

CREATE TABLE runs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    started_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at        TIMESTAMP NULL,
    status          ENUM('active', 'victory', 'defeat') DEFAULT 'active',
    rooms_cleared   INT DEFAULT 0,
    enemies_killed  INT DEFAULT 0,
    damage_dealt    INT DEFAULT 0,
    damage_taken    INT DEFAULT 0,
    credits_earned  INT DEFAULT 0,
    cards_collected INT DEFAULT 0,
    score           INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE run_cards (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    run_id  INT NOT NULL,
    card_id INT NOT NULL,
    FOREIGN KEY (run_id)  REFERENCES runs  (id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards (id) ON DELETE CASCADE
);

INSERT INTO rarities (name, display_order) VALUES
('common',    1),
('uncommon',  2),
('rare',      3),
('epic',      4),
('legendary', 5);

INSERT INTO card_subtypes (card_type, subtype) VALUES
('active',    'melee'),
('active',    'heal'),
('active',    'defense'),
('active',    'drain'),
('automatic', 'melee'),
('automatic', 'heal'),
('automatic', 'defense');

INSERT INTO cards (card_name, subtype_id, rarity_id, base_damage, base_heal, cooldown_seconds, shop_cost, description) VALUES
('Quick Strike',     1, 1,   20,  0,  3,   0, 'Deal damage to enemies within 120px.'),
('Iron Fist',        1, 3,   55,  0,  5,  50, 'A powerful close-range blow dealing 55 damage within 90px.'),
('Nova Burst',       1, 4,  110,  0,  9,  80, 'Unleash an explosion dealing 110 damage to all enemies within 200px.'),
('Shadow Blade',     1, 5,  180,  0, 15, 130, 'A devastating strike dealing 180 damage to enemies within 160px.'),
('Heal Pulse',       2, 1,    0, 25, 10,   0, 'Restore 25 HP.'),
('Mending Wave',     2, 4,    0, 70, 15,  85, 'Release a healing wave that restores 70 HP.'),
('Phoenix Elixir',   2, 5,    0,  0, 30, 150, 'Consume a legendary elixir to fully restore all HP.'),
('Blood Siphon',     4, 3,   40, 20, 12,  65, 'Drain the nearest enemy for 40 damage and restore 20 HP.'),
('Wood Shield',      3, 1,    0,  0,  8,   0, 'Absorb the next 20 damage.'),
('Stone Wall',       3, 3,    0,  0, 12,  60, 'Erect a wall of stone that absorbs the next 50 damage.'),
('Mirror Guard',     3, 4,    0,  0, 14,  90, 'Gain 35 shield and 1.5s of invincibility.'),
('Diamond Fortress', 3, 5,    0,  0, 18, 140, 'Crystallize your body, absorbing the next 100 damage.'),
('Lifetap',          6, 1,    0, 20,  0,  40, 'Restore 20 HP each time you kill an enemy.'),
('Iron Skin',        7, 1,    0,  0,  0,  45, 'Gain 8 shield each time you hit an enemy.'),
('Rebound',          5, 3,   15,  0,  0,  65, 'When hit, deal 15 damage to enemies within 150px.'),
('Berserker Rush',   5, 3,   20,  0,  0,  70, 'Dashing deals 20 damage to enemies within 100px.'),
('Last Stand',       7, 4,    0,  0,  0,  95, 'When hit below 30% HP, gain 2s of invincibility.'),
('Chain Kill',       5, 4,   25,  0,  0, 100, 'Killing an enemy deals 25 damage to all others within 200px.');

INSERT INTO card_effect_params (card_id, effect_range, spread, shield, invincibility, trigger_event, threshold, heal_pct, full_heal, from_enemy) VALUES
(1,    32, 0.628, NULL, NULL, NULL,              NULL, NULL, 0, 0),
(2,    28, 1.099, NULL, NULL, NULL,              NULL, NULL, 0, 0),
(3,    72, 3.142, NULL, NULL, NULL,              NULL, NULL, 0, 0),
(4,    48, 2.356, NULL, NULL, NULL,              NULL, NULL, 0, 0),
(7,  NULL,  NULL, NULL, NULL, NULL,              NULL, NULL, 1, 0),
(9,  NULL,  NULL,   20, NULL, NULL,              NULL, NULL, 0, 0),
(10, NULL,  NULL,   50, NULL, NULL,              NULL, NULL, 0, 0),
(11, NULL,  NULL,   35,  1.5, NULL,              NULL, NULL, 0, 0),
(12, NULL,  NULL,  100, NULL, NULL,              NULL, NULL, 0, 0),
(13, NULL,  NULL, NULL, NULL, 'on_kill',         NULL, NULL, 0, 0),
(14, NULL,  NULL,    8, NULL, 'on_attack',       NULL, NULL, 0, 0),
(15,   48,  NULL, NULL, NULL, 'on_hit_received', NULL, NULL, 0, 0),
(16,   32,  NULL, NULL, NULL, 'on_dash',         NULL, NULL, 0, 0),
(17, NULL,  NULL, NULL,    2, 'on_hit_received',  0.3, NULL, 0, 0),
(18,   64,  NULL, NULL, NULL, 'on_kill',         NULL, NULL, 0, 1);

CREATE OR REPLACE VIEW v_leaderboard AS
SELECT
    u.id                      AS user_id,
    u.username,
    MAX(r.score)              AS best_score,
    COUNT(r.id)               AS total_runs,
    SUM(r.status = 'victory') AS victories
FROM runs r
JOIN users u ON u.id = r.user_id
WHERE r.status != 'active'
GROUP BY u.id, u.username;

CREATE OR REPLACE VIEW v_user_run_summary AS
SELECT
    user_id,
    COUNT(*)                                AS total_runs,
    SUM(status = 'victory')                 AS victories,
    SUM(status = 'defeat')                  AS defeats,
    ROUND(AVG(status = 'victory') * 100, 1) AS win_rate_pct,
    MAX(score)                              AS best_score,
    ROUND(AVG(score), 0)                    AS avg_score,
    SUM(enemies_killed)                     AS total_enemies_killed,
    ROUND(AVG(enemies_killed), 1)           AS avg_enemies_per_run,
    SUM(rooms_cleared)                      AS total_rooms_cleared,
    ROUND(AVG(rooms_cleared), 1)            AS avg_rooms_per_run,
    SUM(damage_dealt)                       AS total_damage_dealt,
    SUM(damage_taken)                       AS total_damage_taken
FROM runs
WHERE status != 'active'
GROUP BY user_id;

CREATE OR REPLACE VIEW v_card_usage AS
SELECT
    ru.user_id,
    c.id        AS card_id,
    c.card_name,
    ra.name     AS rarity,
    cs.card_type,
    cs.subtype,
    COUNT(*)    AS times_collected
FROM run_cards rc
JOIN cards         c  ON c.id  = rc.card_id
JOIN card_subtypes cs ON cs.id = c.subtype_id
JOIN rarities      ra ON ra.id = c.rarity_id
JOIN runs          ru ON ru.id = rc.run_id
GROUP BY ru.user_id, c.id, c.card_name, ra.name, cs.card_type, cs.subtype;

CREATE OR REPLACE VIEW v_top_cards AS
SELECT
    c.card_name,
    ra.name     AS rarity,
    cs.card_type,
    cs.subtype,
    COUNT(*)    AS times_collected
FROM run_cards rc
JOIN cards         c  ON c.id  = rc.card_id
JOIN card_subtypes cs ON cs.id = c.subtype_id
JOIN rarities      ra ON ra.id = c.rarity_id
GROUP BY c.id, c.card_name, ra.name, cs.card_type, cs.subtype;

CREATE OR REPLACE VIEW v_global_stats AS
SELECT
    COUNT(DISTINCT user_id)                 AS total_players,
    COUNT(*)                                AS total_runs,
    SUM(status = 'victory')                 AS total_victories,
    ROUND(AVG(status = 'victory') * 100, 1) AS global_win_rate_pct,
    ROUND(AVG(score), 0)                    AS avg_score,
    MAX(score)                              AS record_score
FROM runs
WHERE status != 'active';