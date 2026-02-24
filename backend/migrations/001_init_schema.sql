-- Migration 001 : Schéma initial complet — Akwaba Bébé
-- Date : 2026-02-24
-- Auteur : Siahoué Siaka
--
-- ⚠️  SCRIPT DE RECRÉATION COMPLÈTE
-- À utiliser UNIQUEMENT sur une base vide ou avant tout partage de données clients.
-- Supprime toutes les tables existantes et les recrée proprement.
--
-- Usage RDS :
--   psql "postgresql://USER:PASS@rds-endpoint/akwaba_db" -f 001_init_schema.sql
-- =============================================================================

BEGIN;

-- Suppression dans l'ordre inverse des dépendances FK
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS shipping_zones CASCADE;

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    full_name     VARCHAR(150)        NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT                NOT NULL,
    phone         VARCHAR(50),
    role          VARCHAR(20)         NOT NULL DEFAULT 'customer',
    created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- CATEGORIES
-- =============================================================================
CREATE TABLE categories (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- =============================================================================
-- PRODUCTS
-- =============================================================================
CREATE TABLE products (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(255)   NOT NULL,
    description    TEXT,
    price          NUMERIC(10, 2) NOT NULL,
    stock_quantity INTEGER        NOT NULL DEFAULT 0,
    image_url      TEXT,
    category_id    INTEGER        REFERENCES categories(id),
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ORDERS
-- =============================================================================
CREATE TABLE orders (
    id                  SERIAL PRIMARY KEY,
    customer_firstname  VARCHAR(100)   NOT NULL,
    customer_lastname   VARCHAR(100)   NOT NULL,
    customer_email      VARCHAR(255)   NOT NULL,
    customer_phone      VARCHAR(50)    NOT NULL,
    delivery_method     VARCHAR(50)    NOT NULL,
    shipping_city       VARCHAR(100),
    shipping_commune    VARCHAR(100),
    shipping_address    TEXT,
    order_note          TEXT,
    create_account      BOOLEAN        NOT NULL DEFAULT FALSE,
    total_amount        NUMERIC(10, 2) NOT NULL,
    status              VARCHAR(50)    NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ORDER_ITEMS
-- =============================================================================
CREATE TABLE order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER        NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    product_id INTEGER        NOT NULL REFERENCES products(id),
    quantity   INTEGER        NOT NULL,
    price      NUMERIC(10, 2) NOT NULL
);

-- =============================================================================
-- ARTICLES (Blog)
-- =============================================================================
CREATE TABLE articles (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    image_url  TEXT,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES de performance
-- =============================================================================
CREATE INDEX idx_orders_email   ON orders(customer_email);
CREATE INDEX idx_orders_status  ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_products_cat   ON products(category_id);

COMMIT;
