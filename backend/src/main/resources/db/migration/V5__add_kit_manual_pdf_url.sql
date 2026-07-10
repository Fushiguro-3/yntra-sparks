-- V5__add_kit_manual_pdf_url.sql
-- Stores the uploaded kit manual PDF URL shown to teachers alongside videos.

ALTER TABLE kit ADD COLUMN IF NOT EXISTS manual_pdf_url VARCHAR(1000);
