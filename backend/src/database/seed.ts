import bcrypt from 'bcrypt';
import { db } from './db.js';

async function seed() {
  try {
    console.log('Seeding database...');

    // Create test user
    const passwordHash = await bcrypt.hash('password123', 10);

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, email_verified) 
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run('test@progress2win.com', passwordHash, 'Test', 'User', 1);

    console.log('✅ Seed completed successfully');
    console.log('📧 Test user: test@progress2win.com');
    console.log('🔑 Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
