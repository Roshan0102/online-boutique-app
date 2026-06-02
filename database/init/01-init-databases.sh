#!/bin/bash
set -e

echo "Creating databases for CloudCart microservices..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE cloudcart_users;
    CREATE DATABASE cloudcart_products;
    CREATE DATABASE cloudcart_orders;
EOSQL

echo "Initializing user service database schema..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "cloudcart_users" -f /docker-entrypoint-initdb.d/init-users.sql

echo "Initializing product service database schema..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "cloudcart_products" -f /docker-entrypoint-initdb.d/init-products.sql

echo "Initializing order service database schema..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "cloudcart_orders" -f /docker-entrypoint-initdb.d/init-orders.sql

echo "Database initialization completed successfully!"
