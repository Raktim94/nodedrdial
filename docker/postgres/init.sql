-- TwilioHub OSS — PostgreSQL initialization
-- This runs once when the container is first created

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fast text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- for composite indexes

-- Ensure UTC timezone
SET timezone = 'UTC';
