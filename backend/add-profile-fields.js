// Add profile fields to users table
const db = require('./db/db');

async function addProfileFields() {
  try {
    console.log('Adding profile fields to users table...');
    
    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS firstname VARCHAR(100),
      ADD COLUMN IF NOT EXISTS lastname VARCHAR(100),
      ADD COLUMN IF NOT EXISTS birthday DATE;
    `);
    
    console.log('✅ Profile fields added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding profile fields:', error.message);
    process.exit(1);
  }
}

addProfileFields();
