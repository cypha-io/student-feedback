// Simple database connection test
const { db } = require('../lib/db/index.ts');
const { teachers } = require('../lib/db/schema.ts');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.select().from(teachers).limit(1);
    console.log('Database connection successful!', result);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();
