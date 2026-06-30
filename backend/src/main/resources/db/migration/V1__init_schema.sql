-- V1__init_schema.sql
-- Initial schema based on docs/er-diagram.md

CREATE TABLE school (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    school_id BIGINT REFERENCES school(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    last_login TIMESTAMP
);

CREATE TABLE category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE kit (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(1000),
    category_id BIGINT REFERENCES category(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE video (
    id BIGSERIAL PRIMARY KEY,
    kit_id BIGINT NOT NULL REFERENCES kit(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    youtube_video_id VARCHAR(50) NOT NULL,
    sequence INT NOT NULL DEFAULT 0
);

CREATE TABLE school_kit (
    school_id BIGINT NOT NULL REFERENCES school(id),
    kit_id BIGINT NOT NULL REFERENCES kit(id),
    purchased_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (school_id, kit_id)
);

-- Helpful indexes for the most common access patterns
CREATE INDEX idx_app_user_school_id ON app_user(school_id);
CREATE INDEX idx_kit_category_id ON kit(category_id);
CREATE INDEX idx_video_kit_id ON video(kit_id);