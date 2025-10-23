-- Add file_name column to teacher_verifications table
ALTER TABLE teacher_verifications ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
