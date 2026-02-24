-- Migration 004 — Table contact_messages
-- Auteur : Siahoué Siaka
-- Date : 2026-02-24

BEGIN;

CREATE TABLE contact_messages (
    id         SERIAL PRIMARY KEY,
    full_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL,
    subject    VARCHAR(100) NOT NULL,
    message    TEXT         NOT NULL,
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMIT;
