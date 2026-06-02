-- Database initialization for Product Service

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert realistic sample products
INSERT INTO products (name, description, price, category, image_url) VALUES
('CloudCart Pro Laptop', 'High-performance laptop for developers and creators. 32GB LPDDR5 RAM, 1TB NVMe SSD, M3 Pro equivalent processor, 16-inch Liquid Retina display.', 1999.99, 'Electronics', 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=600&auto=format&fit=crop&q=80'),
('Active Noise-Canceling Headphones', 'Immersive studio-quality sound with hybrid active noise cancellation, smart ambient mode, and 45-hour quick-charge battery.', 299.99, 'Audio', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'),
('Ergonomic Mechanical Keyboard', 'Hot-swappable tactile switches, double-shot PBT keycaps, customized sound dampening foam, and multi-device wireless connectivity.', 149.50, 'Accessories', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'),
('Smart Fitness Watch GPS', 'Comprehensive wellness tracker with built-in GPS, multi-sport tracking, sleep analysis, and up to 14 days of battery life in smartwatch mode.', 249.99, 'Wearables', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'),
('Ultra-Wide Curved Monitor 34"', 'WQHD (3440 x 1440) 1500R curved monitor featuring a 165Hz refresh rate, 1ms response time, and HDR400 for stunning gaming and workflow visuals.', 499.99, 'Electronics', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80'),
('Minimalist Leather Travel Backpack', 'Handcrafted top-grain water-resistant leather with a dedicated 16" padded laptop sleeve, hidden security pocket, and luggage pass-through.', 129.99, 'Accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'),
('Portable SSD 2TB', 'Ultra-fast read/write speeds up to 2000MB/s, drop-resistant up to 2 meters, IP65 water and dust resistance, USB-C 3.2 Gen 2x2 interface.', 179.99, 'Electronics', 'https://images.unsplash.com/photo-1609709295948-17d775c7484d?w=600&auto=format&fit=crop&q=80'),
('Studio Condenser Microphone', 'Cardioid polar pattern studio microphone with desktop scissor arm stand, shock mount, pop filter, and a high-resolution 24-bit/192kHz USB audio interface.', 119.99, 'Audio', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80');
