-- V3__add_kit_price.sql
-- Adds display-only price field to kit table.
-- Per founder request: informational display only, NOT a marketplace/purchase flow.
-- No cart, no checkout, no payment — out of scope for MVP (see requirements.md ss3).

ALTER TABLE kit ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);