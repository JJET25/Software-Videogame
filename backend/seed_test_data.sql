USE dimension_deck;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED TEST DATA — 30 elementos de prueba
--   Los 10 usuarios ya existen (insertados en ejecución previa):
--     id 3  player_one    id 4  shadowhunter   id 5  darkknightz
--     id 6  arcane_mage   id 7  swift_blade    id 8  iron_warrior
--     id 9  void_walker   id 10 star_lord99    id 11 neon_rider
--     id 12 cyber_witch
--
--   Este script agrega:
--     · 10 runs  (2 activos, 4 victorias, 4 derrotas)
--     · 10 run_cards distribuidos entre los runs
--
-- Usa variables de sesión para no depender del valor exacto del AUTO_INCREMENT.
-- Los triggers manejan run_player_state, cards_collected y run_log.
-- ═══════════════════════════════════════════════════════════════════════════

-- Captura IDs de los usuarios ya existentes
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

-- ── 10 Runs (uno por uno para capturar LAST_INSERT_ID) ───────────────────────

-- run A: player_one, victoria sólida
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_player, 'victory', 1850,  8, 42, 3200,  850, 400, 0,
        '2026-06-07 10:00:00', '2026-06-07 10:35:00');
SET @r_a = LAST_INSERT_ID();

-- run B: player_one, derrota rápida
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_player, 'defeat', 620, 3, 18, 1100, 980, 150, 0,
        '2026-06-08 14:00:00', '2026-06-08 14:12:00');
SET @r_b = LAST_INSERT_ID();

-- run C: shadowhunter, mejor score del batch
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_shadow, 'victory', 2300, 10, 55, 4100, 600, 500, 0,
        '2026-06-06 09:00:00', '2026-06-06 09:50:00');
SET @r_c = LAST_INSERT_ID();

-- run D: darkknightz, derrota rápida
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_dark, 'defeat', 310, 2, 10, 600, 1200, 80, 0,
        '2026-06-05 16:00:00', '2026-06-05 16:08:00');
SET @r_d = LAST_INSERT_ID();

-- run E: arcane_mage, derrota
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_arcane, 'defeat', 540, 3, 14, 900, 1100, 120, 0,
        '2026-06-04 20:00:00', '2026-06-04 20:10:00');
SET @r_e = LAST_INSERT_ID();

-- run F: swift_blade, victoria cómoda
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_swift, 'victory', 1620, 7, 38, 2800, 720, 360, 0,
        '2026-06-08 11:00:00', '2026-06-08 11:30:00');
SET @r_f = LAST_INSERT_ID();

-- run G: iron_warrior, derrota ajustada
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_iron, 'defeat', 780, 4, 22, 1400, 1050, 180, 0,
        '2026-06-07 18:00:00', '2026-06-07 18:18:00');
SET @r_g = LAST_INSERT_ID();

-- run H: void_walker, victoria difícil
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_void, 'victory', 1200, 5, 29, 2100, 950, 280, 0,
        '2026-06-06 20:00:00', '2026-06-06 20:22:00');
SET @r_h = LAST_INSERT_ID();

-- run I: star_lord99, activo en progreso
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_star, 'active', 0, 0, 0, 0, 0, 0, 0,
        '2026-06-09 11:55:00', NULL);
SET @r_i = LAST_INSERT_ID();

-- run J: neon_rider, activo recién iniciado
INSERT INTO runs (user_id, status, score, rooms_cleared, enemies_killed,
                  damage_dealt, damage_taken, credits_earned, cards_collected,
                  started_at, ended_at)
VALUES (@u_neon, 'active', 0, 0, 0, 0, 0, 0, 0,
        '2026-06-09 12:05:00', NULL);
SET @r_j = LAST_INSERT_ID();

-- ── 10 Run-Cards ─────────────────────────────────────────────────────────────
-- slot = 'active'    → subtype_id 1-4  (active/melee, heal, defense, drain)
-- slot = 'automatic' → subtype_id 5-7  (auto/melee, heal, defense)
-- El trigger trg_cards_collected_count incrementa runs.cards_collected
-- y escribe en run_log automáticamente por cada fila.

INSERT INTO run_cards (run_id, card_id, slot) VALUES
-- run A (player_one, victoria): Quick Strike + Lifetap
(@r_a,  1, 'active'),    -- Quick Strike   active/melee   common
(@r_a, 13, 'automatic'), -- Lifetap        auto/heal      common
-- run B (player_one, derrota): solo Heal Pulse de inicio
(@r_b,  5, 'active'),    -- Heal Pulse     active/heal    common
-- run C (shadowhunter, victoria): deck de alto daño
(@r_c,  4, 'active'),    -- Shadow Blade   active/melee   legendary
(@r_c, 11, 'active'),    -- Mirror Guard   active/defense epic
(@r_c, 18, 'automatic'), -- Chain Kill     auto/melee     epic
-- run F (swift_blade, victoria): defensa + presión
(@r_f,  9, 'active'),    -- Wood Shield    active/defense common
(@r_f, 15, 'automatic'), -- Rebound        auto/melee     rare
-- run G (iron_warrior, derrota): Wound Echo automático
(@r_g, 21, 'automatic'), -- Wound Echo     auto/melee     common
-- run I (star_lord99, activo): Iron Skin desde el inicio
(@r_i, 14, 'automatic'); -- Iron Skin      auto/defense   common
