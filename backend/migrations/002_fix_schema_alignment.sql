-- Migration 002 : Alignement schéma BDD ↔ code Go
-- Date : 2026-02-24
-- Auteur : Siahoué Siaka
--
-- Problèmes corrigés :
--   1. orders.status DEFAULT 'en_attente' → 'pending' (cohérence avec le code)
--   2. order_items.order_id / product_id : passage en NOT NULL (intégrité des données)
--   3. products.category_id : suppression du DEFAULT 1 (insertion silencieuse)
--
-- ⚠️  Avant d'exécuter sur RDS :
--   - Vérifier qu'aucune commande existante a status = 'en_attente' (sinon la migrer aussi)
--   - S'assurer qu'aucun order_items n'a order_id ou product_id NULL
--
-- Vérifications préalables (à lancer AVANT la migration) :
--   SELECT COUNT(*) FROM orders WHERE status = 'en_attente';
--   SELECT COUNT(*) FROM order_items WHERE order_id IS NULL OR product_id IS NULL;
-- =============================================================================

BEGIN;

-- 1. Migrer les statuts 'en_attente' existants vers 'pending'
UPDATE orders SET status = 'pending' WHERE status = 'en_attente';

-- 2. Changer le DEFAULT de orders.status de 'en_attente' à 'pending'
ALTER TABLE orders
    ALTER COLUMN status SET DEFAULT 'pending';

-- 3. Rendre order_items.order_id NOT NULL
--    (les FK existent déjà, il manque juste la contrainte NOT NULL)
ALTER TABLE order_items
    ALTER COLUMN order_id SET NOT NULL;

-- 4. Rendre order_items.product_id NOT NULL
ALTER TABLE order_items
    ALTER COLUMN product_id SET NOT NULL;

-- 5. Supprimer le DEFAULT 1 sur products.category_id
--    (un produit sans catégorie doit être refusé explicitement, pas silencieusement assigné)
ALTER TABLE products
    ALTER COLUMN category_id DROP DEFAULT;

COMMIT;

-- =============================================================================
-- Optionnel : indexes de performance (recommandés pour la prod)
-- À appliquer séparément si la table est volumineuse (CREATE INDEX CONCURRENTLY)
-- =============================================================================
-- CREATE INDEX CONCURRENTLY idx_orders_email   ON orders(customer_email);
-- CREATE INDEX CONCURRENTLY idx_orders_status  ON orders(status);
-- CREATE INDEX CONCURRENTLY idx_orders_created ON orders(created_at DESC);
-- CREATE INDEX CONCURRENTLY idx_products_cat   ON products(category_id);
