// Run migrations directly, then start server
import { migrate } from './db/migrate';

async function start() {
  try {
    console.log('Starting application...');
    console.log('Running database migrations...');
    await migrate();
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    // Exit if migrations fail - we need the database to be set up
    console.error('Failed to run migrations. Exiting...');
    process.exit(1);
  }
  
  // Start the server
  console.log('Starting server...');
  require('./index');
}

start();

