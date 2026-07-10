-- V7__seed_demo_kits.sql
-- Demo catalog data for public grade browsing.

INSERT INTO category (name)
VALUES ('Electronics'), ('Robotics'), ('Engineering')
ON CONFLICT (name) DO NOTHING;

WITH electronics AS (
    SELECT id FROM category WHERE name = 'Electronics'
)
INSERT INTO kit (title, description, thumbnail_url, manual_pdf_url, grade, price, category_id, status)
SELECT
    'Circuit Explorers',
    'Students build simple circuits with LEDs, switches, and resistors while learning current flow.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    NULL,
    'Grade 3',
    1499.00,
    electronics.id,
    'ACTIVE'
FROM electronics
WHERE NOT EXISTS (SELECT 1 FROM kit WHERE title = 'Circuit Explorers');

WITH robotics AS (
    SELECT id FROM category WHERE name = 'Robotics'
)
INSERT INTO kit (title, description, thumbnail_url, manual_pdf_url, grade, price, category_id, status)
SELECT
    'Robo Starter Kit',
    'A first robotics kit where students assemble a wheeled bot and program movement challenges.',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
    NULL,
    'Grade 5',
    2499.00,
    robotics.id,
    'ACTIVE'
FROM robotics
WHERE NOT EXISTS (SELECT 1 FROM kit WHERE title = 'Robo Starter Kit');

WITH engineering AS (
    SELECT id FROM category WHERE name = 'Engineering'
)
INSERT INTO kit (title, description, thumbnail_url, manual_pdf_url, grade, price, category_id, status)
SELECT
    'Bridge Builders',
    'Teams design, construct, and test model bridges while comparing strength and stability.',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    NULL,
    'Grade 6',
    1799.00,
    engineering.id,
    'ACTIVE'
FROM engineering
WHERE NOT EXISTS (SELECT 1 FROM kit WHERE title = 'Bridge Builders');

INSERT INTO video (kit_id, title, youtube_video_id, sequence)
SELECT k.id, 'Introduction to circuits', 'dQw4w9WgXcQ', 1
FROM kit k
WHERE k.title = 'Circuit Explorers'
AND NOT EXISTS (SELECT 1 FROM video v WHERE v.kit_id = k.id AND v.title = 'Introduction to circuits');

INSERT INTO video (kit_id, title, youtube_video_id, sequence)
SELECT k.id, 'Build your first robot', 'dQw4w9WgXcQ', 1
FROM kit k
WHERE k.title = 'Robo Starter Kit'
AND NOT EXISTS (SELECT 1 FROM video v WHERE v.kit_id = k.id AND v.title = 'Build your first robot');

INSERT INTO video (kit_id, title, youtube_video_id, sequence)
SELECT k.id, 'Bridge design challenge', 'dQw4w9WgXcQ', 1
FROM kit k
WHERE k.title = 'Bridge Builders'
AND NOT EXISTS (SELECT 1 FROM video v WHERE v.kit_id = k.id AND v.title = 'Bridge design challenge');
