-- ==============================================================================
-- PRODUCTION ORDERS SCHEMA - REDESIGNED WITH PROPER RELATIONAL STRUCTURE
-- ==============================================================================
-- This schema defines the production orders system tables with proper relational structure
-- Updated: Changed from JSON arrays to proper foreign key relationships
-- Structure: ProductionOrders -> ProductionOrderItems -> Colors/Packaging tables
-- Each production order item can have multiple related knit colors, body colors, and packaging options
-- ==============================================================================

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS ProductionOrdersKnitColors;
DROP TABLE IF EXISTS ProductionOrdersBodyColors;
DROP TABLE IF EXISTS ProductionOrdersPackaging;
DROP TABLE IF EXISTS ProductionOrderItems;
DROP TABLE IF EXISTS ProductionOrders;

-- ==============================================================================
-- PRODUCTION ORDERS TABLE (Must be created first due to foreign key dependencies)
-- ==============================================================================
CREATE TABLE ProductionOrders (
    pk_production_order_id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Foreign Keys
    fk_customer_id INT NOT NULL,
    fk_factory_id INT NOT NULL,
    
    -- Order Information
    po_number VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE NOT NULL,
    actual_delivery_date DATE NULL,
    
    -- Shipping Information
    shipping_method ENUM('OCEAN', 'AIR', 'GROUND', 'EXPRESS') NOT NULL DEFAULT 'OCEAN',
    
    -- Status and Tracking
    status ENUM('PENDING', 'IN_PROGRESS', 'QUALITY_CHECK', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    
    -- Totals
    total_quantity INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    
    -- Additional Information
    notes TEXT,
    
    -- Audit Fields
    user_owner VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_production_orders_customer (fk_customer_id),
    INDEX idx_production_orders_factory (fk_factory_id),
    INDEX idx_production_orders_po_number (po_number),
    INDEX idx_production_orders_status (status),
    INDEX idx_production_orders_order_date (order_date),
    INDEX idx_production_orders_expected_delivery (expected_delivery_date),
    INDEX idx_production_orders_user_owner (user_owner),
    
    -- Foreign Key Constraints (Note: These tables must exist in your database)
    CONSTRAINT fk_production_orders_customer 
        FOREIGN KEY (fk_customer_id) REFERENCES Customers(pk_customer_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_production_orders_factory 
        FOREIGN KEY (fk_factory_id) REFERENCES Factories(pk_factories_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

-- ==============================================================================
-- PRODUCTION ORDER ITEMS TABLE (Must be created before related tables)
-- ==============================================================================
CREATE TABLE ProductionOrderItems (
    pk_production_order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Foreign Keys
    fk_production_order_id INT NOT NULL,
    fk_product_id INT UNSIGNED NOT NULL,
    fk_category_id INT UNSIGNED NOT NULL,
    
    -- Item Information
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    item_number VARCHAR(50),
    
    -- Quantity and Pricing
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    tax_rate DECIMAL(5,4) DEFAULT 0.0000,
    
    -- Note: Knit colors, body colors, and packaging are now in separate related tables
    -- ProductionOrdersKnitColors, ProductionOrdersBodyColors, ProductionOrdersPackaging
    -- Each linked via fk_production_order_item_id
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_production_order_items_order (fk_production_order_id),
    INDEX idx_production_order_items_product (fk_product_id),
    INDEX idx_production_order_items_category (fk_category_id),
    INDEX idx_production_order_items_item_number (item_number),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_production_order_items_order 
        FOREIGN KEY (fk_production_order_id) REFERENCES ProductionOrders(pk_production_order_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_production_order_items_product 
        FOREIGN KEY (fk_product_id) REFERENCES Products(pk_product_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_production_order_items_category 
        FOREIGN KEY (fk_category_id) REFERENCES ProductCategory(pk_product_category_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

-- ==============================================================================
-- PRODUCTION ORDERS KNIT COLORS TABLE
-- ==============================================================================
CREATE TABLE ProductionOrdersKnitColors (
    pk_production_orders_knit_color_id INT AUTO_INCREMENT PRIMARY KEY,
    fk_production_order_item_id INT NOT NULL, -- Foreign key to ProductionOrderItems
    name VARCHAR(100) NOT NULL,
    fk_yarn_id INT NOT NULL, -- Foreign key to existing Yarns table
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_production_orders_knit_colors_item (fk_production_order_item_id),
    INDEX idx_production_orders_knit_colors_status (status),
    INDEX idx_production_orders_knit_colors_name (name),
    INDEX idx_production_orders_knit_colors_yarn (fk_yarn_id),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_production_orders_knit_colors_item
        FOREIGN KEY (fk_production_order_item_id) REFERENCES ProductionOrderItems(pk_production_order_item_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_production_orders_knit_colors_yarn 
        FOREIGN KEY (fk_yarn_id) REFERENCES Yarn(pk_yarn_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

-- ==============================================================================
-- PRODUCTION ORDERS BODY COLORS TABLE
-- ==============================================================================
CREATE TABLE ProductionOrdersBodyColors (
    pk_production_orders_body_color_id INT AUTO_INCREMENT PRIMARY KEY,
    fk_production_order_item_id INT NOT NULL, -- Foreign key to ProductionOrderItems
    name VARCHAR(100) NOT NULL,
    fk_yarn_id INT NOT NULL, -- Foreign key to existing Yarns table
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_production_orders_body_colors_item (fk_production_order_item_id),
    INDEX idx_production_orders_body_colors_status (status),
    INDEX idx_production_orders_body_colors_name (name),
    INDEX idx_production_orders_body_colors_yarn (fk_yarn_id),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_production_orders_body_colors_item
        FOREIGN KEY (fk_production_order_item_id) REFERENCES ProductionOrderItems(pk_production_order_item_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_production_orders_body_colors_yarn 
        FOREIGN KEY (fk_yarn_id) REFERENCES Yarn(pk_yarn_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

-- ==============================================================================
-- PRODUCTION ORDERS PACKAGING TABLE (Junction table to existing Packaging)
-- ==============================================================================
CREATE TABLE ProductionOrdersPackaging (
    pk_production_orders_packaging_id INT AUTO_INCREMENT PRIMARY KEY,
    fk_production_order_item_id INT NOT NULL, -- Foreign key to ProductionOrderItems
    fk_packaging_id INT NOT NULL, -- Foreign key to existing Packaging table
    quantity INT DEFAULT 1, -- How many of this packaging type for this item
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_production_orders_packaging_item (fk_production_order_item_id),
    INDEX idx_production_orders_packaging_packaging (fk_packaging_id),
    
    -- Unique constraint to prevent duplicate packaging per item
    UNIQUE KEY uk_production_order_item_packaging (fk_production_order_item_id, fk_packaging_id),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_production_orders_packaging_item
        FOREIGN KEY (fk_production_order_item_id) REFERENCES ProductionOrderItems(pk_production_order_item_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_production_orders_packaging_packaging
        FOREIGN KEY (fk_packaging_id) REFERENCES Packaging(pk_packaging_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

-- ==============================================================================
-- SAMPLE DATA INSERTS (Updated for new relational structure)
-- ==============================================================================

-- Note: First ensure you have sample ProductionOrders and ProductionOrderItems
-- Example: Insert sample production order
/*
INSERT INTO ProductionOrders (
    fk_customer_id, fk_factory_id, po_number, order_date, 
    expected_delivery_date, shipping_method, total_quantity, 
    total_amount, notes, user_owner
) VALUES (
    1, 1, 'PO-2024-001', '2024-07-31', '2024-09-15', 
    'OCEAN', 500, 12750.00, 
    'High priority order with custom branding', 'Production Manager'
);

-- Example: Insert production order item
INSERT INTO ProductionOrderItems (
    fk_production_order_id, fk_product_id, fk_category_id,
    item_name, item_description, item_number, quantity, unit_price, tax_rate
) VALUES (
    1, 1, 1,
    'Custom Knit Sweater', 'Premium cotton blend sweater with custom logo',
    'SKU-001', 300, 25.50, 0.0875
);
*/

-- Sample knit colors for production order items (assuming yarn IDs 1-5 exist in Yarn table)
INSERT INTO ProductionOrdersKnitColors (fk_production_order_item_id, name, fk_yarn_id, description) VALUES
(1, 'Navy Blue Knit', 1, 'Classic navy blue yarn for professional knit items'),
(1, 'Heather Gray Knit', 2, 'Comfortable heather gray yarn blend for knitting'),
(2, 'Forest Green Knit', 3, 'Deep forest green yarn for knit products');

-- Sample body colors for production order items (assuming yarn IDs 6-9 exist in Yarn table)  
INSERT INTO ProductionOrdersBodyColors (fk_production_order_item_id, name, fk_yarn_id, description) VALUES
(1, 'White Body', 6, 'Pure white yarn for body/base color'),
(1, 'Cream Body', 7, 'Soft cream yarn for body/base color'),
(2, 'Light Gray Body', 8, 'Light gray yarn for body/base color');

-- Sample packaging options for production order items (assuming packaging IDs 1-3 exist in Packaging table)
INSERT INTO ProductionOrdersPackaging (fk_production_order_item_id, fk_packaging_id, quantity) VALUES
(1, 1, 1), -- Item 1 uses Packaging ID 1 (quantity 1)
(1, 2, 2), -- Item 1 uses Packaging ID 2 (quantity 2)  
(2, 3, 1); -- Item 2 uses Packaging ID 3 (quantity 1)

-- ==============================================================================
-- EXAMPLE USAGE QUERIES (Updated for new relational structure)
-- ==============================================================================

-- Query to get all production order items with their colors and packaging
/*
SELECT 
    poi.*,
    po.po_number,
    -- Knit Colors
    GROUP_CONCAT(DISTINCT CONCAT(pokc.name, ' (', y1.yarn_color, ')') SEPARATOR ', ') as knit_colors,
    -- Body Colors  
    GROUP_CONCAT(DISTINCT CONCAT(pobc.name, ' (', y2.yarn_color, ')') SEPARATOR ', ') as body_colors,
    -- Packaging
    GROUP_CONCAT(DISTINCT CONCAT(p.name, ' (qty: ', pop.quantity, ')') SEPARATOR ', ') as packaging_options
FROM ProductionOrderItems poi
JOIN ProductionOrders po ON poi.fk_production_order_id = po.pk_production_order_id
LEFT JOIN ProductionOrdersKnitColors pokc ON poi.pk_production_order_item_id = pokc.fk_production_order_item_id
LEFT JOIN Yarn y1 ON pokc.fk_yarn_id = y1.pk_yarn_id
LEFT JOIN ProductionOrdersBodyColors pobc ON poi.pk_production_order_item_id = pobc.fk_production_order_item_id
LEFT JOIN Yarn y2 ON pobc.fk_yarn_id = y2.pk_yarn_id
LEFT JOIN ProductionOrdersPackaging pop ON poi.pk_production_order_item_id = pop.fk_production_order_item_id
LEFT JOIN Packaging p ON pop.fk_packaging_id = p.pk_packaging_id
WHERE poi.pk_production_order_item_id = 1
GROUP BY poi.pk_production_order_item_id;
*/

-- Query to get all knit colors for a specific production order item
/*
SELECT 
    poi.item_name,
    pokc.name as knit_color_name,
    pokc.description,
    y.yarn_color,
    y.color_code,
    y.card_number
FROM ProductionOrderItems poi
JOIN ProductionOrdersKnitColors pokc ON poi.pk_production_order_item_id = pokc.fk_production_order_item_id
JOIN Yarn y ON pokc.fk_yarn_id = y.pk_yarn_id
WHERE poi.pk_production_order_item_id = 1;
*/

-- Query to get production orders with item counts and related color/packaging counts
/*
SELECT 
    po.*,
    COUNT(DISTINCT poi.pk_production_order_item_id) as item_count,
    COUNT(DISTINCT pokc.pk_production_orders_knit_color_id) as knit_color_count,
    COUNT(DISTINCT pobc.pk_production_orders_body_color_id) as body_color_count,
    COUNT(DISTINCT pop.pk_production_orders_packaging_id) as packaging_count
FROM ProductionOrders po
LEFT JOIN ProductionOrderItems poi ON po.pk_production_order_id = poi.fk_production_order_id
LEFT JOIN ProductionOrdersKnitColors pokc ON poi.pk_production_order_item_id = pokc.fk_production_order_item_id
LEFT JOIN ProductionOrdersBodyColors pobc ON poi.pk_production_order_item_id = pobc.fk_production_order_item_id
LEFT JOIN ProductionOrdersPackaging pop ON poi.pk_production_order_item_id = pop.fk_production_order_item_id
GROUP BY po.pk_production_order_id;
*/

-- ==============================================================================
-- NOTES ON NEW RELATIONAL STRUCTURE
-- ==============================================================================
/*
The updated schema uses proper relational structure instead of JSON arrays:

Table Relationships:
1. ProductionOrders (1) -> ProductionOrderItems (many)
2. ProductionOrderItems (1) -> ProductionOrdersKnitColors (many)
3. ProductionOrderItems (1) -> ProductionOrdersBodyColors (many)  
4. ProductionOrderItems (1) -> ProductionOrdersPackaging (many)
5. ProductionOrdersKnitColors -> Yarn (many to 1)
6. ProductionOrdersBodyColors -> Yarn (many to 1)

Benefits of this approach:
1. **Proper normalization** - Each color/packaging record belongs to a specific item
2. **Better data integrity** - Foreign key constraints ensure referential integrity
3. **Easier queries** - Standard JOIN operations instead of JSON parsing  
4. **Scalable** - Can easily add more fields to color/packaging tables
5. **Created when needed** - Colors and packaging are created specifically for each order item
6. **Cascading deletes** - When an item is deleted, its colors/packaging are automatically removed
7. **Better indexing** - Proper indexes on foreign keys for performance

Workflow:
1. Create ProductionOrder
2. Create ProductionOrderItems for that order
3. For each item, create specific:
   - ProductionOrdersKnitColors (multiple allowed)
   - ProductionOrdersBodyColors (multiple allowed)  
   - ProductionOrdersPackaging (multiple allowed)

Each color/packaging record is tied to a specific production order item,
allowing for complete customization per item while maintaining data integrity.
*/