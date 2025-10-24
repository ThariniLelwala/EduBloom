-- Add firstname, lastname, and birthday columns to users table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS firstname VARCHAR(100),
ADD COLUMN IF NOT EXISTS lastname VARCHAR(100),
ADD COLUMN IF NOT EXISTS birthday DATE;
