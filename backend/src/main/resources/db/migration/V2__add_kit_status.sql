-- V2__add_kit_status.sql
-- Adds status column to kit table for soft-delete (archive) support
-- Per er-diagram.md open question #3: kit deletion is archive not hard delete

ALTER TABLE kit ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';