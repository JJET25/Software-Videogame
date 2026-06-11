-- Migration: add is_admin column + create Admin user
-- Run once against dimension_deck database

USE dimension_deck;

-- Check if column exists before running to avoid duplicate column error
ALTER TABLE users
  ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER password_hash;
