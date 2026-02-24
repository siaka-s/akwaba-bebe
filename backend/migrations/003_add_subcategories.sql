-- =============================================================================
-- Migration 003 : Ajout des sous-catégories — Akwaba Bébé
-- Date    : 2026-02-24
-- Auteur  : Siahoué Siaka
--
-- Modifications :
--   1. Création de la table subcategories (id, name, category_id FK)
--   2. Ajout de subcategory_id (nullable) sur products
--   3. Index de performance
--
-- Notes :
--   - ON DELETE CASCADE sur subcategories : supprimer une catégorie efface
--     automatiquement ses sous-catégories (cohérence DB)
--   - ON DELETE SET NULL sur products.subcategory_id : supprimer une
--     sous-catégorie met le champ à NULL sans bloquer la suppression
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- TABLE : subcategories
-- -----------------------------------------------------------------------------
CREATE TABLE subcategories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    category_id INTEGER      NOT NULL REFERENCES categories(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- TABLE : products — ajout de subcategory_id (nullable)
-- -----------------------------------------------------------------------------
ALTER TABLE products
    ADD COLUMN subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- INDEX de performance
-- -----------------------------------------------------------------------------
CREATE INDEX idx_subcategories_cat ON subcategories(category_id);
CREATE INDEX idx_products_subcat   ON products(subcategory_id);

COMMIT;
