-- V4__add_kit_grade.sql
-- Adds the target grade/grade band shown alongside kit category and price.

ALTER TABLE kit ADD COLUMN IF NOT EXISTS grade VARCHAR(100);
