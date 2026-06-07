USE dimension_deck;

-- Procedures must be dropped before tables (they're not dropped automatically)
DROP PROCEDURE IF EXISTS sp_start_run;
DROP PROCEDURE IF EXISTS sp_end_run;
DROP PROCEDURE IF EXISTS sp_add_card_to_run;
DROP PROCEDURE IF EXISTS sp_get_shop_offerings;
DROP PROCEDURE IF EXISTS sp_buy_card;
DROP PROCEDURE IF EXISTS sp_log_event;

SET foreign_key_checks = 0;
DROP TABLE IF EXISTS run_log;
DROP TABLE IF EXISTS shop_offerings;
DROP TABLE IF EXISTS run_player_state;
DROP TABLE IF EXISTS run_cards;
DROP TABLE IF EXISTS card_effect_params;
DROP TABLE IF EXISTS runs;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS card_subtypes;
DROP TABLE IF EXISTS rarities;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS enemies;
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
    id              INT       AUTO_INCREMENT PRIMARY KEY,
    user_id         INT       NOT NULL,
    status          ENUM('active','victory','defeat') DEFAULT 'active',
    score           INT       DEFAULT 0,
    rooms_cleared   INT       DEFAULT 0,
    enemies_killed  INT       DEFAULT 0,
    damage_dealt    INT       DEFAULT 0,
    damage_taken    INT       DEFAULT 0,
    credits_earned  INT       DEFAULT 0,
    cards_collected INT       DEFAULT 0,
    started_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at        TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE run_player_state (
    run_id       INT PRIMARY KEY,
    health       INT   NOT NULL DEFAULT 100,
    max_health   INT   NOT NULL DEFAULT 100,
    shield       INT   NOT NULL DEFAULT 0,
    credits      INT   NOT NULL DEFAULT 0,
    active_slots INT   NOT NULL DEFAULT 3,
    auto_slots   INT   NOT NULL DEFAULT 4,
    FOREIGN KEY (run_id) REFERENCES runs (id) ON DELETE CASCADE
);

CREATE TABLE run_cards (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    run_id      INT NOT NULL,
    card_id     INT NOT NULL,
    slot        ENUM('active','automatic') NOT NULL,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_id)  REFERENCES runs  (id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards (id) ON DELETE CASCADE
);

CREATE TABLE shop_offerings (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    run_id  INT NOT NULL,
    card_id INT NOT NULL,
    price   INT NOT NULL,
    sold    TINYINT(1) DEFAULT 0,
    FOREIGN KEY (run_id)  REFERENCES runs  (id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards (id) ON DELETE CASCADE
);

CREATE TABLE run_log (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    run_id     INT         NOT NULL,
    event_type ENUM('room_cleared','enemy_killed','card_acquired',
                    'slot_upgraded','shop_purchase','damage_dealt',
                    'damage_taken','heal') NOT NULL,
    value      INT         NOT NULL DEFAULT 0,
    card_id    INT         DEFAULT NULL,
    logged_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_id)  REFERENCES runs  (id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards (id) ON DELETE SET NULL
);

CREATE TABLE enemies (
    id                 INT         AUTO_INCREMENT PRIMARY KEY,
    name               VARCHAR(50) UNIQUE NOT NULL,
    archetype          ENUM('swarm','tank','ranged','boss') NOT NULL,
    dimension          ENUM('dark_ages','old_west') NOT NULL,
    hp                 INT         NOT NULL CHECK (hp > 0),
    speed              FLOAT       NOT NULL CHECK (speed > 0),
    contact_dmg        INT         NOT NULL DEFAULT 0,
    width_px           INT         NOT NULL DEFAULT 16,
    height_px          INT         NOT NULL DEFAULT 16,
    shoot_rate         FLOAT       DEFAULT NULL,
    preferred_distance INT         DEFAULT NULL
);

-- ── Views ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_user_run_summary AS
SELECT
    user_id,
    COUNT(*)                        AS total_runs,
    SUM(status = 'victory')         AS total_wins,
    SUM(status = 'defeat')          AS total_losses,
    MAX(score)                      AS best_score,
    AVG(score)                      AS avg_score,
    SUM(rooms_cleared)              AS total_rooms,
    SUM(enemies_killed)             AS total_kills
FROM runs
WHERE status IN ('victory', 'defeat')
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

-- All purchasable cards with full stats — source for sp_get_shop_offerings
CREATE OR REPLACE VIEW v_shop_catalog AS
SELECT
    c.id,
    c.card_name,
    cs.card_type,
    cs.subtype,
    r.name             AS rarity,
    r.display_order    AS rarity_order,
    c.base_damage,
    c.base_heal,
    c.cooldown_seconds,
    c.shop_cost,
    c.description,
    ep.effect_range,
    ep.spread,
    ep.shield,
    ep.invincibility,
    ep.trigger_event,
    ep.threshold,
    ep.heal_pct,
    ep.full_heal,
    ep.from_enemy
FROM cards c
JOIN card_subtypes cs ON cs.id = c.subtype_id
JOIN rarities      r  ON r.id  = c.rarity_id
LEFT JOIN card_effect_params ep ON ep.card_id = c.id
WHERE c.shop_cost > 0;

-- Per-run summary with card list — useful for a run history endpoint
CREATE OR REPLACE VIEW v_run_detail AS
SELECT
    r.id        AS run_id,
    r.user_id,
    u.username,
    r.status,
    r.started_at,
    r.ended_at,
    TIMESTAMPDIFF(SECOND, r.started_at, COALESCE(r.ended_at, NOW())) AS duration_seconds,
    r.score,
    r.rooms_cleared,
    r.enemies_killed,
    r.damage_dealt,
    r.damage_taken,
    r.credits_earned,
    r.cards_collected,
    GROUP_CONCAT(c.card_name ORDER BY c.card_name SEPARATOR ', ') AS cards_used
FROM runs r
JOIN users u ON u.id = r.user_id
LEFT JOIN run_cards rc ON rc.run_id = r.id
LEFT JOIN cards    c  ON c.id  = rc.card_id
GROUP BY r.id, r.user_id, u.username, r.status, r.started_at,
         r.ended_at, r.score, r.rooms_cleared, r.enemies_killed,
         r.damage_dealt, r.damage_taken, r.credits_earned, r.cards_collected;

-- Cards each player uses most in winning runs
CREATE OR REPLACE VIEW v_player_best_deck AS
SELECT
    ru.user_id,
    u.username,
    c.id        AS card_id,
    c.card_name,
    cs.card_type,
    ra.name     AS rarity,
    COUNT(*)    AS times_in_victory
FROM run_cards rc
JOIN runs          ru ON ru.id  = rc.run_id
JOIN users         u  ON u.id   = ru.user_id
JOIN cards         c  ON c.id   = rc.card_id
JOIN card_subtypes cs ON cs.id  = c.subtype_id
JOIN rarities      ra ON ra.id  = c.rarity_id
WHERE ru.status = 'victory'
GROUP BY ru.user_id, u.username, c.id, c.card_name, cs.card_type, ra.name;

-- Win rate per card — shows how powerful each card actually is
CREATE OR REPLACE VIEW v_card_win_rate AS
SELECT
    c.id        AS card_id,
    c.card_name,
    ra.name     AS rarity,
    cs.card_type,
    COUNT(*)                                  AS total_uses,
    SUM(r.status = 'victory')                 AS wins,
    ROUND(AVG(r.status = 'victory') * 100, 1) AS win_rate_pct
FROM run_cards rc
JOIN runs          r  ON r.id  = rc.run_id
JOIN cards         c  ON c.id  = rc.card_id
JOIN rarities      ra ON ra.id = c.rarity_id
JOIN card_subtypes cs ON cs.id = c.subtype_id
WHERE r.status != 'active'
GROUP BY c.id, c.card_name, ra.name, cs.card_type;

-- Currently active runs with elapsed time and player state
CREATE OR REPLACE VIEW v_active_runs AS
SELECT
    r.id        AS run_id,
    r.user_id,
    u.username,
    r.started_at,
    TIMESTAMPDIFF(SECOND, r.started_at, NOW()) AS elapsed_seconds,
    r.rooms_cleared,
    r.enemies_killed,
    rps.credits,
    rps.active_slots,
    rps.auto_slots
FROM runs r
JOIN users u ON u.id = r.user_id
LEFT JOIN run_player_state rps ON rps.run_id = r.id
WHERE r.status = 'active';

-- ── Seed data ─────────────────────────────────────────────────────────────────
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

-- subtype_id reference:
--   1 = active/melee   2 = active/heal   3 = active/defense
--   4 = active/drain   5 = auto/melee    6 = auto/heal   7 = auto/defense
--
-- rarity_id reference:
--   1 = common   2 = uncommon   3 = rare   4 = epic   5 = legendary
--
-- Balance v2 — see ShopItems.js changelog for full reasoning.

INSERT INTO cards (card_name, subtype_id, rarity_id, base_damage, base_heal, cooldown_seconds, shop_cost, description) VALUES
-- id 1  starter
('Quick Strike',     1, 1,   25,  0,  2,    0, 'Deal damage to enemies within 80px.'),
-- id 2
('Iron Fist',        1, 3,   55,  0,  5,  120, 'A powerful close-range blow dealing 55 damage within 48px.'),
-- id 3
('Nova Burst',       1, 4,  110,  0,  9,  210, 'Unleash an explosion dealing 110 damage to all enemies within 72px.'),
-- id 4
('Shadow Blade',     1, 5,  250,  0, 10,  360, 'A devastating strike dealing 250 damage to enemies within 48px.'),
-- id 5  starter
('Heal Pulse',       2, 1,    0, 25,  5,    0, 'Restore 25 HP.'),
-- id 6
('Mending Wave',     2, 4,    0, 85, 12,  220, 'Release a healing wave that restores 85 HP.'),
-- id 7
('Phoenix Elixir',   2, 5,    0,  0, 18,  380, 'Consume a legendary elixir to fully restore all HP.'),
-- id 8
('Blood Siphon',     4, 3,   45, 20, 10,  140, 'Drain the nearest enemy for 45 damage and restore 20 HP.'),
-- id 9  starter
('Wood Shield',      3, 1,    0,  0,  6,    0, 'Absorb the next 20 damage.'),
-- id 10
('Stone Wall',       3, 3,    0,  0, 10,  125, 'Erect a wall of stone that absorbs the next 50 damage.'),
-- id 11
('Mirror Guard',     3, 4,    0,  0, 14,  200, 'Gain 58 shield and 1.5s of invincibility.'),
-- id 12
('Diamond Fortress', 3, 5,    0,  0, 15,  350, 'Crystallize your body, absorbing the next 100 damage.'),
-- id 13
('Lifetap',          6, 1,    0, 20,  0,   65, 'Restore 20 HP each time you kill an enemy.'),
-- id 14
('Iron Skin',        7, 1,    0,  0,  0,   70, 'Gain 8 shield each time you hit an enemy.'),
-- id 15
('Rebound',          5, 3,   15,  0,  0,  120, 'When hit, deal 15 damage to enemies within 48px.'),
-- id 16
('Berserker Rush',   5, 3,   20,  0,  0,  130, 'Dashing deals 20 damage to enemies within 32px.'),
-- id 17
('Last Stand',       7, 4,    0,  0,  0,  205, 'When hit below 30% HP, gain 2s of invincibility.'),
-- id 18
('Remedy Vial',      2, 3,    0, 42,  8,  130, 'Drink a swift remedy restoring 42 HP.'),
-- id 19
('Chain Kill',       5, 4,   25,  0,  0,  215, 'Killing an enemy deals 25 damage to all others within 64px.'),
-- id 20
('Quick Recovery',   6, 1,    0,  8,  0,   65, 'When hit, instantly recover 8 HP.'),
-- id 21
('Soul Siphon',      6, 3,    0, 18,  0,  135, 'Killing an enemy restores 18 HP and grants 10 shield.'),
-- id 22
('Wound Echo',       5, 1,   10,  0,  0,   65, 'Each hit deals 10 bonus damage to the struck enemy.');

INSERT INTO enemies (name, archetype, dimension, hp, speed, contact_dmg, width_px, height_px, shoot_rate, preferred_distance) VALUES
('Skeleton',     'tank',   'dark_ages',  90,  38, 18, 28, 28, NULL, NULL),
('Slime',        'swarm',  'dark_ages',  16,  82,  6, 12, 12, NULL, NULL),
('DungeonRat',   'swarm',  'dark_ages',  16,  82,  6, 12, 12, NULL, NULL),
('SkeletonKing', 'boss',   'dark_ages', 900,  32, 35, 80, 80,  1.5, NULL),
('Bandit',       'ranged', 'old_west',   30,  52,  8, 16, 16,  1.5,  180),
('CactusThug',   'tank',   'old_west',   90,  38, 18, 28, 28, NULL, NULL),
('DesertRat',    'swarm',  'old_west',   16,  82,  6, 12, 12, NULL, NULL);

-- card_effect_params — IDs match the INSERT order above.
INSERT INTO card_effect_params (card_id, effect_range, spread, shield, invincibility, trigger_event, threshold, heal_pct, full_heal, from_enemy) VALUES
-- Active melee
(1,    80, 1.200, NULL, NULL, NULL,              NULL, NULL, 0, 0),  -- Quick Strike
(2,    48, 1.099, NULL, NULL, NULL,              NULL, NULL, 0, 0),  -- Iron Fist      range 28→48
(3,    72, 3.142, NULL, NULL, NULL,              NULL, NULL, 0, 0),  -- Nova Burst
(4,    48, 2.356, NULL, NULL, NULL,              NULL, NULL, 0, 0),  -- Shadow Blade

-- Active heal
(7,  NULL,  NULL, NULL, NULL, NULL,              NULL, NULL, 1, 0),  -- Phoenix Elixir (full_heal)

-- Active defense
(9,  NULL,  NULL,   20, NULL, NULL,              NULL, NULL, 0, 0),  -- Wood Shield
(10, NULL,  NULL,   50, NULL, NULL,              NULL, NULL, 0, 0),  -- Stone Wall
(11, NULL,  NULL,   58,  1.5, NULL,              NULL, NULL, 0, 0),  -- Mirror Guard   shield 35→58
(12, NULL,  NULL,  100, NULL, NULL,              NULL, NULL, 0, 0),  -- Diamond Fortress

-- Automatic
(13, NULL,  NULL, NULL, NULL, 'on_kill',         NULL, NULL, 0, 0),  -- Lifetap
(14, NULL,  NULL,    8, NULL, 'on_attack',       NULL, NULL, 0, 0),  -- Iron Skin
(15,   48,  NULL, NULL, NULL, 'on_hit_received', NULL, NULL, 0, 0),  -- Rebound
(16,   32,  NULL, NULL, NULL, 'on_dash',         NULL, NULL, 0, 0),  -- Berserker Rush
(17, NULL,  NULL, NULL,  2.0, 'on_hit_received', 0.30, NULL, 0, 0),  -- Last Stand
(19,   64,  NULL, NULL, NULL, 'on_kill',         NULL, NULL, 0, 1),  -- Chain Kill     (from_enemy)
(20, NULL,  NULL, NULL, NULL, 'on_hit_received', NULL, NULL, 0, 0),  -- Quick Recovery
(21, NULL,  NULL,   10, NULL, 'on_kill',         NULL, NULL, 0, 0);  -- Soul Siphon

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS (6)
-- Note: triggers on a table are dropped automatically when the table is dropped,
-- so no explicit DROP TRIGGER is needed here.
-- ═══════════════════════════════════════════════════════════════════════════

DELIMITER $$

-- 1. After a new run is inserted: cancel any other active run for this user
--    and auto-create the run_player_state record.
CREATE TRIGGER trg_after_run_insert
    AFTER INSERT ON runs
    FOR EACH ROW
BEGIN
    UPDATE runs
    SET    status = 'defeat', ended_at = NOW()
    WHERE  user_id = NEW.user_id AND status = 'active' AND id != NEW.id;

    INSERT IGNORE INTO run_player_state (run_id) VALUES (NEW.id);
END$$

-- 2. Before updating a run: prevent the score from ever decreasing.
CREATE TRIGGER trg_run_score_guard
    BEFORE UPDATE ON runs
    FOR EACH ROW
BEGIN
    IF NEW.score < OLD.score THEN
        SET NEW.score = OLD.score;
    END IF;
END$$

-- 3. Before updating a run: block reopening a finished run and auto-set ended_at.
CREATE TRIGGER trg_run_status_guard
    BEFORE UPDATE ON runs
    FOR EACH ROW FOLLOWS trg_run_score_guard
BEGIN
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot reopen a finished run';
    END IF;
    IF OLD.status = 'active' AND NEW.status != 'active' AND NEW.ended_at IS NULL THEN
        SET NEW.ended_at = NOW();
    END IF;
END$$

-- 4. After a card is added to a run: increment cards_collected and log the event.
CREATE TRIGGER trg_cards_collected_count
    AFTER INSERT ON run_cards
    FOR EACH ROW
BEGIN
    UPDATE runs SET cards_collected = cards_collected + 1 WHERE id = NEW.run_id;
    INSERT INTO run_log (run_id, event_type, card_id, value)
    VALUES (NEW.run_id, 'card_acquired', NEW.card_id, 1);
END$$

-- 5. After a shop offering is marked sold: log the purchase event.
CREATE TRIGGER trg_shop_offering_sold
    AFTER UPDATE ON shop_offerings
    FOR EACH ROW
BEGIN
    IF NEW.sold = 1 AND OLD.sold = 0 THEN
        INSERT INTO run_log (run_id, event_type, card_id, value)
        VALUES (NEW.run_id, 'shop_purchase', NEW.card_id, NEW.price);
    END IF;
END$$

-- 6. Before updating run_player_state: clamp credits to 0 (never go negative).
CREATE TRIGGER trg_prevent_negative_credits
    BEFORE UPDATE ON run_player_state
    FOR EACH ROW
BEGIN
    IF NEW.credits < 0 THEN
        SET NEW.credits = 0;
    END IF;
END$$

DELIMITER ;

-- ═══════════════════════════════════════════════════════════════════════════
-- STORED PROCEDURES (6)
-- ═══════════════════════════════════════════════════════════════════════════

DELIMITER $$

-- 1. Start a new run.
--    trg_after_run_insert handles: cancelling old active run + creating run_player_state.
CREATE PROCEDURE sp_start_run(IN p_user_id INT)
BEGIN
    INSERT INTO runs (user_id) VALUES (p_user_id);
    SELECT LAST_INSERT_ID() AS run_id;
END$$

-- 2. Finalise a run: compute score server-side and persist all stats.
CREATE PROCEDURE sp_end_run(
    IN p_run_id         INT,
    IN p_user_id        INT,
    IN p_status         VARCHAR(10),
    IN p_rooms_cleared  INT,
    IN p_enemies_killed INT,
    IN p_damage_dealt   INT,
    IN p_damage_taken   INT,
    IN p_credits_earned INT
)
BEGIN
    DECLARE v_score INT;

    SET v_score = (CASE WHEN p_status = 'victory' THEN 1000 ELSE 0 END)
               + (COALESCE(p_rooms_cleared,  0) * 50)
               + (COALESCE(p_enemies_killed, 0) * 20)
               + FLOOR(COALESCE(p_damage_dealt, 0) / 10);

    UPDATE runs
    SET
        status         = p_status,
        score          = v_score,
        rooms_cleared  = COALESCE(p_rooms_cleared,  rooms_cleared),
        enemies_killed = COALESCE(p_enemies_killed, enemies_killed),
        damage_dealt   = COALESCE(p_damage_dealt,   damage_dealt),
        damage_taken   = COALESCE(p_damage_taken,   damage_taken),
        credits_earned = COALESCE(p_credits_earned, credits_earned)
    WHERE id = p_run_id AND user_id = p_user_id AND status = 'active';
    -- trg_run_status_guard auto-sets ended_at and blocks reopening

    SELECT v_score AS score, ROW_COUNT() AS affected;
END$$

-- 3. Add a single card to a run's deck.
--    trg_cards_collected_count increments the counter and logs the event.
CREATE PROCEDURE sp_add_card_to_run(IN p_run_id INT, IN p_card_id INT)
BEGIN
    INSERT IGNORE INTO run_cards (run_id, card_id) VALUES (p_run_id, p_card_id);
    SELECT ROW_COUNT() AS inserted;
END$$

-- 4. Generate (or retrieve) the shop offerings for a run.
--    First call persists 5 random cards; subsequent calls return the same set.
CREATE PROCEDURE sp_get_shop_offerings(IN p_run_id INT)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM shop_offerings WHERE run_id = p_run_id LIMIT 1) THEN
        INSERT INTO shop_offerings (run_id, card_id, price)
        SELECT p_run_id, sc.id, sc.shop_cost
        FROM   v_shop_catalog sc
        WHERE  sc.id NOT IN (SELECT card_id FROM run_cards WHERE run_id = p_run_id)
        ORDER BY RAND()
        LIMIT 5;
    END IF;

    SELECT
        so.id           AS offering_id,
        so.sold,
        sc.id           AS card_id,
        sc.card_name,
        sc.card_type,
        sc.subtype,
        sc.rarity,
        sc.base_damage,
        sc.base_heal,
        sc.cooldown_seconds,
        so.price        AS shop_cost,
        sc.description,
        sc.effect_range,
        sc.spread,
        sc.shield,
        sc.invincibility,
        sc.trigger_event,
        sc.threshold,
        sc.heal_pct,
        sc.full_heal,
        sc.from_enemy
    FROM shop_offerings so
    JOIN v_shop_catalog sc ON sc.id = so.card_id
    WHERE so.run_id = p_run_id
    ORDER BY so.id;
END$$

-- 5. Process a card purchase: validate offering, mark sold, add to deck.
CREATE PROCEDURE sp_buy_card(IN p_run_id INT, IN p_card_id INT)
BEGIN
    DECLARE v_sold   TINYINT DEFAULT 0;
    DECLARE v_exists INT     DEFAULT 0;

    SELECT COUNT(*), COALESCE(MAX(sold), 0)
    INTO   v_exists, v_sold
    FROM   shop_offerings
    WHERE  run_id = p_run_id AND card_id = p_card_id;

    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Offering not found';
    END IF;
    IF v_sold = 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Card already sold';
    END IF;

    -- trg_shop_offering_sold logs the shop_purchase event automatically
    UPDATE shop_offerings SET sold = 1
    WHERE  run_id = p_run_id AND card_id = p_card_id;

    -- trg_cards_collected_count increments counter + logs card_acquired
    INSERT IGNORE INTO run_cards (run_id, card_id) VALUES (p_run_id, p_card_id);

    SELECT 'ok' AS result;
END$$

-- 6. Write an arbitrary event to the run log (utility for the API).
CREATE PROCEDURE sp_log_event(
    IN p_run_id     INT,
    IN p_event_type ENUM('room_cleared','enemy_killed','card_acquired',
                         'slot_upgraded','shop_purchase','damage_dealt',
                         'damage_taken','heal'),
    IN p_value      INT,
    IN p_card_id    INT
)
BEGIN
    INSERT INTO run_log (run_id, event_type, value, card_id)
    VALUES (p_run_id, p_event_type, COALESCE(p_value, 0), p_card_id);
END$$

DELIMITER ;
