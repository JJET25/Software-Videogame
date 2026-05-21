-- =============================================================
-- Dimension Deck - MySQL Schema
-- Inferred from GDD v1 (2026-04).
-- MySQL 8.0 compatible
-- =============================================================

CREATE DATABASE IF NOT EXISTS dimension_deck CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dimension_deck;

-- ---------------------------------------------
-- CORE CATALOG TABLES  (static / seed data)
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS dimension (
  dimension_id   INT          NOT NULL AUTO_INCREMENT,
  name           VARCHAR(64)  NOT NULL,
  order_in_run   TINYINT      NOT NULL DEFAULT 1,
  PRIMARY KEY (dimension_id)
);

CREATE TABLE IF NOT EXISTS card (
  card_id          INT          NOT NULL AUTO_INCREMENT,
  name             VARCHAR(128) NOT NULL,
  card_type        ENUM('active','automatic') NOT NULL,
  rarity           ENUM('common','rare','epic','legendary') NOT NULL,
  energy_cost      TINYINT      NOT NULL DEFAULT 0,
  base_damage      INT          NOT NULL DEFAULT 0,
  base_heal        INT          NOT NULL DEFAULT 0,
  cooldown_seconds FLOAT        NOT NULL DEFAULT 1.0,
  effect_json      JSON         NULL,
  PRIMARY KEY (card_id)
);

CREATE TABLE IF NOT EXISTS synergy (
  synergy_id        INT          NOT NULL AUTO_INCREMENT,
  trigger_card_id   INT          NOT NULL,
  catalyst_card_id  INT          NOT NULL,
  result_name       VARCHAR(128) NOT NULL,
  damage_multiplier FLOAT        NOT NULL DEFAULT 1.0,
  radius_tiles      TINYINT      NOT NULL DEFAULT 0,
  duration_seconds  FLOAT        NOT NULL DEFAULT 0.0,
  PRIMARY KEY (synergy_id),
  CONSTRAINT fk_syn_trigger  FOREIGN KEY (trigger_card_id)  REFERENCES card(card_id),
  CONSTRAINT fk_syn_catalyst FOREIGN KEY (catalyst_card_id) REFERENCES card(card_id)
);

CREATE TABLE IF NOT EXISTS enemy_type (
  enemy_type_id INT          NOT NULL AUTO_INCREMENT,
  name          VARCHAR(128) NOT NULL,
  archetype     ENUM('swarm','tank','ranged','boss') NOT NULL,
  dimension_id  INT          NOT NULL,
  base_hp       INT          NOT NULL,
  base_damage   INT          NOT NULL,
  sprite_size   TINYINT      NOT NULL DEFAULT 16,
  is_boss       TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (enemy_type_id),
  CONSTRAINT fk_enemy_dim FOREIGN KEY (dimension_id) REFERENCES dimension(dimension_id)
);

CREATE TABLE IF NOT EXISTS hub_upgrade (
  upgrade_id    INT          NOT NULL AUTO_INCREMENT,
  name          VARCHAR(128) NOT NULL,
  description   TEXT,
  credit_cost   INT          NOT NULL,
  upgrade_type  ENUM('stat_boost','slot_expansion','capacity') NOT NULL,
  value         INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (upgrade_id)
);

-- ---------------------------------------------
-- PLAYER & ACCOUNT
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS player (
  player_id        INT          NOT NULL AUTO_INCREMENT,
  username         VARCHAR(64)  NOT NULL UNIQUE,
  email            VARCHAR(256) NOT NULL UNIQUE,
  password_hash    VARCHAR(256) NOT NULL,
  hub_credits      INT          NOT NULL DEFAULT 0,
  total_runs       INT          NOT NULL DEFAULT 0,
  total_victories  INT          NOT NULL DEFAULT 0,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_id)
);

CREATE TABLE IF NOT EXISTS player_hub_upgrade (
  id           INT      NOT NULL AUTO_INCREMENT,
  player_id    INT      NOT NULL,
  upgrade_id   INT      NOT NULL,
  purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_player_upgrade (player_id, upgrade_id),
  CONSTRAINT fk_phu_player  FOREIGN KEY (player_id)  REFERENCES player(player_id),
  CONSTRAINT fk_phu_upgrade FOREIGN KEY (upgrade_id) REFERENCES hub_upgrade(upgrade_id)
);

-- ---------------------------------------------
-- RUN  (one roguelite attempt)
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS run (
  run_id                INT      NOT NULL AUTO_INCREMENT,
  player_id             INT      NOT NULL,
  outcome               ENUM('in_progress','victory','defeat') NOT NULL DEFAULT 'in_progress',
  starting_dimension_id INT      NOT NULL,
  current_dimension_id  INT      NOT NULL,
  current_room_number   INT      NOT NULL DEFAULT 1,
  death_room_number     INT               DEFAULT NULL,
  total_credits_earned  INT      NOT NULL DEFAULT 0,
  seed                  VARCHAR(64)       DEFAULT NULL,
  active_card_slots     TINYINT  NOT NULL DEFAULT 3,
  auto_card_slots       TINYINT  NOT NULL DEFAULT 4,
  started_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at              DATETIME          DEFAULT NULL,
  PRIMARY KEY (run_id),
  CONSTRAINT fk_run_player    FOREIGN KEY (player_id)              REFERENCES player(player_id),
  CONSTRAINT fk_run_start_dim FOREIGN KEY (starting_dimension_id) REFERENCES dimension(dimension_id),
  CONSTRAINT fk_run_cur_dim   FOREIGN KEY (current_dimension_id)   REFERENCES dimension(dimension_id)
);

-- ---------------------------------------------
-- ROOMS
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS run_room (
  run_room_id    INT      NOT NULL AUTO_INCREMENT,
  run_id         INT      NOT NULL,
  dimension_id   INT      NOT NULL,
  room_number    INT      NOT NULL,
  room_type      ENUM('combat','chest','shop','shrine','glitch','boss') NOT NULL,
  cleared        TINYINT(1) NOT NULL DEFAULT 0,
  time_spent_sec INT               DEFAULT NULL,
  entered_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cleared_at     DATETIME          DEFAULT NULL,
  PRIMARY KEY (run_room_id),
  CONSTRAINT fk_rr_run FOREIGN KEY (run_id)       REFERENCES run(run_id),
  CONSTRAINT fk_rr_dim FOREIGN KEY (dimension_id) REFERENCES dimension(dimension_id)
);

-- ---------------------------------------------
-- DECK
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS run_deck_card (
  run_deck_card_id      INT      NOT NULL AUTO_INCREMENT,
  run_id                INT      NOT NULL,
  card_id               INT      NOT NULL,
  card_level            ENUM('base','upgraded','max') NOT NULL DEFAULT 'base',
  acquired_from         ENUM('starter','chest','shop','boss_reward','glitch_pillar') NOT NULL,
  room_number_acquired  INT      NOT NULL DEFAULT 0,
  discarded             TINYINT(1) NOT NULL DEFAULT 0,
  room_number_discarded INT               DEFAULT NULL,
  PRIMARY KEY (run_deck_card_id),
  CONSTRAINT fk_rdc_run  FOREIGN KEY (run_id)  REFERENCES run(run_id),
  CONSTRAINT fk_rdc_card FOREIGN KEY (card_id) REFERENCES card(card_id)
);

-- ---------------------------------------------
-- SHOP
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS shop_inventory (
  shop_inventory_id INT        NOT NULL AUTO_INCREMENT,
  run_room_id       INT        NOT NULL,
  card_id           INT        NOT NULL,
  price             INT        NOT NULL,
  sold              TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (shop_inventory_id),
  CONSTRAINT fk_si_room FOREIGN KEY (run_room_id) REFERENCES run_room(run_room_id),
  CONSTRAINT fk_si_card FOREIGN KEY (card_id)     REFERENCES card(card_id)
);

-- ---------------------------------------------
-- TELEMETRY
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS card_usage_event (
  event_id            INT      NOT NULL AUTO_INCREMENT,
  run_id              INT      NOT NULL,
  run_room_id         INT      NOT NULL,
  card_id             INT      NOT NULL,
  resulted_in_synergy TINYINT(1) NOT NULL DEFAULT 0,
  used_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id),
  CONSTRAINT fk_cue_run  FOREIGN KEY (run_id)      REFERENCES run(run_id),
  CONSTRAINT fk_cue_room FOREIGN KEY (run_room_id) REFERENCES run_room(run_room_id),
  CONSTRAINT fk_cue_card FOREIGN KEY (card_id)     REFERENCES card(card_id)
);

CREATE TABLE IF NOT EXISTS synergy_trigger_event (
  event_id     INT      NOT NULL AUTO_INCREMENT,
  run_id       INT      NOT NULL,
  run_room_id  INT      NOT NULL,
  synergy_id   INT      NOT NULL,
  triggered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id),
  CONSTRAINT fk_ste_run     FOREIGN KEY (run_id)      REFERENCES run(run_id),
  CONSTRAINT fk_ste_room    FOREIGN KEY (run_room_id) REFERENCES run_room(run_room_id),
  CONSTRAINT fk_ste_synergy FOREIGN KEY (synergy_id)  REFERENCES synergy(synergy_id)
);

-- ---------------------------------------------
-- VIEWS
-- ---------------------------------------------

CREATE OR REPLACE VIEW v_card_catalog AS
SELECT
  c.card_id,
  c.name            AS card_name,
  c.card_type,
  c.rarity,
  c.energy_cost,
  c.base_damage,
  c.base_heal,
  c.cooldown_seconds,
  s.synergy_id,
  s.result_name     AS synergy_result,
  s.damage_multiplier AS synergy_multiplier,
  tc.name           AS synergy_trigger_card,
  cc.name           AS synergy_catalyst_card
FROM card c
LEFT JOIN synergy s  ON s.trigger_card_id = c.card_id OR s.catalyst_card_id = c.card_id
LEFT JOIN card tc ON tc.card_id = s.trigger_card_id
LEFT JOIN card cc ON cc.card_id = s.catalyst_card_id;

CREATE OR REPLACE VIEW v_active_deck AS
SELECT
  rdc.run_deck_card_id,
  rdc.run_id,
  rdc.card_level,
  rdc.acquired_from,
  rdc.room_number_acquired,
  c.card_id,
  c.name           AS card_name,
  c.card_type,
  c.rarity,
  c.energy_cost,
  c.base_damage,
  c.base_heal,
  c.cooldown_seconds,
  c.effect_json
FROM run_deck_card rdc
JOIN card c ON c.card_id = rdc.card_id
WHERE rdc.discarded = 0;

CREATE OR REPLACE VIEW v_run_overview AS
SELECT
  r.run_id,
  r.player_id,
  p.username,
  r.outcome,
  r.active_card_slots,
  r.auto_card_slots,
  r.total_credits_earned,
  r.current_room_number,
  r.death_room_number,
  d_start.name  AS starting_dimension,
  d_cur.name    AS current_dimension,
  r.started_at,
  r.ended_at,
  TIMESTAMPDIFF(SECOND, r.started_at, COALESCE(r.ended_at, NOW())) AS run_duration_seconds,
  COUNT(DISTINCT rdc.run_deck_card_id) AS total_cards_in_deck
FROM run r
JOIN player        p       ON p.player_id          = r.player_id
JOIN dimension     d_start ON d_start.dimension_id = r.starting_dimension_id
JOIN dimension     d_cur   ON d_cur.dimension_id   = r.current_dimension_id
LEFT JOIN run_deck_card rdc ON rdc.run_id = r.run_id AND rdc.discarded = 0
GROUP BY
  r.run_id, r.player_id, p.username, r.outcome,
  r.active_card_slots, r.auto_card_slots, r.total_credits_earned,
  r.current_room_number, r.death_room_number,
  d_start.name, d_cur.name, r.started_at, r.ended_at;

CREATE OR REPLACE VIEW v_room_state AS
SELECT
  rr.run_room_id,
  rr.run_id,
  rr.room_number,
  rr.room_type,
  rr.cleared,
  rr.entered_at,
  rr.cleared_at,
  rr.time_spent_sec,
  d.name         AS dimension_name,
  d.dimension_id
FROM run_room rr
JOIN dimension d ON d.dimension_id = rr.dimension_id;

CREATE OR REPLACE VIEW v_shop_inventory AS
SELECT
  si.shop_inventory_id,
  si.run_room_id,
  si.price,
  si.sold,
  c.card_id,
  c.name         AS card_name,
  c.card_type,
  c.rarity,
  c.energy_cost,
  c.base_damage,
  c.base_heal,
  c.cooldown_seconds,
  c.effect_json
FROM shop_inventory si
JOIN card c ON c.card_id = si.card_id;

CREATE OR REPLACE VIEW v_run_card_telemetry AS
SELECT
  cue.run_id,
  c.card_id,
  c.name        AS card_name,
  c.card_type,
  c.rarity,
  COUNT(*)      AS times_used,
  SUM(cue.resulted_in_synergy) AS synergy_triggers
FROM card_usage_event cue
JOIN card c ON c.card_id = cue.card_id
GROUP BY cue.run_id, c.card_id, c.name, c.card_type, c.rarity;

CREATE OR REPLACE VIEW v_hub_upgrade_status AS
SELECT
  hu.upgrade_id,
  hu.name        AS upgrade_name,
  hu.description,
  hu.credit_cost,
  hu.upgrade_type,
  hu.value,
  phu.player_id,
  CASE WHEN phu.id IS NOT NULL THEN 1 ELSE 0 END AS purchased,
  phu.purchased_at
FROM hub_upgrade hu
LEFT JOIN player_hub_upgrade phu ON phu.upgrade_id = hu.upgrade_id;

CREATE OR REPLACE VIEW v_player_profile AS
SELECT
  p.player_id,
  p.username,
  p.hub_credits,
  p.total_runs,
  p.total_victories,
  p.created_at,
  ROUND(100.0 * p.total_victories / NULLIF(p.total_runs, 0), 1) AS win_rate_pct,
  SUM(CASE WHEN hu.upgrade_type = 'slot_expansion' THEN hu.value ELSE 0 END) AS total_slot_upgrades
FROM player p
LEFT JOIN player_hub_upgrade phu ON phu.player_id = p.player_id
LEFT JOIN hub_upgrade hu         ON hu.upgrade_id  = phu.upgrade_id
GROUP BY p.player_id, p.username, p.hub_credits, p.total_runs, p.total_victories, p.created_at;

-- ---------------------------------------------
-- SEED DATA
-- ---------------------------------------------

INSERT IGNORE INTO dimension (name, order_in_run) VALUES
  ('Old West',  1),
  ('Dark Ages', 2);

INSERT IGNORE INTO card (name, card_type, rarity, energy_cost, base_damage, base_heal, cooldown_seconds) VALUES
  ('Quick Strike',      'active',    'common',    1, 20,  0,  1.5),
  ('Area Blast',        'active',    'common',    2, 15,  0,  2.0),
  ('Heal Pulse',        'active',    'common',    2,  0, 25,  4.0),
  ('Oil Slick',         'automatic', 'common',    0,  0,  0,  0.0),
  ('Iron Skin',         'automatic', 'rare',      0,  0,  0,  0.0),
  ('Freeze Shot',       'active',    'rare',      2, 10,  0,  3.0),
  ('Toxic Spore',       'automatic', 'rare',      0,  0,  0,  0.0),
  ('Chain Lightning',   'active',    'epic',      3, 25,  0,  5.0),
  ('Void Anchor',       'automatic', 'epic',      0,  0,  0,  0.0),
  ('Dimensional Edge',  'active',    'legendary', 4, 50,  0, 15.0);

INSERT IGNORE INTO hub_upgrade (name, description, credit_cost, upgrade_type, value) VALUES
  ('Extra Active Slot',    'Increase max active card slots by 1 (up to 5)',       100, 'slot_expansion', 1),
  ('Extra Auto Slot',      'Increase max automatic card slots by 2',              150, 'slot_expansion', 2),
  ('Starting Credits +20', 'Begin each run with 20 bonus dimensional credits',    75,  'stat_boost',    20),
  ('Max HP +25',           'Permanently increase player max HP by 25',            80,  'stat_boost',    25);
