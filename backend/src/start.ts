import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// Run migrations before starting the server
async function start() {
  try {
    const migratePath = join(__dirname, 'db', 'migrate.js');
    
    if (existsSync(migratePath)) {
      console.log('Running database migrations...');
      try {
        execSync('node dist/db/migrate.js', { stdio: 'inherit', cwd: process.cwd() });
        console.log('Migrations completed successfully!');
      } catch (migrateError) {
        console.error('Migration failed:', migrateError);
        // Continue anyway - might be that tables already exist
      }
    } else {
      console.log('Migration file not found at:', migratePath);
      console.log('Skipping migrations...');
    }
  } catch (error) {
    console.error('Migration check error:', error);
  }
  
  // Start the server
  console.log('Starting server...');
  require('./index');
}

start();

