import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './connection';

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('Running database migrations...');
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('Database migrations completed successfully!');
    
    // Ensure default RC tracks
    const defaultTracks = [
      { name: 'Racing Track', description: 'High-speed asphalt track designed for RC racing sessions.' },
      { name: 'Mud Track', description: 'Off-road muddy terrain for rally-style RC experiences.' },
      { name: 'Crawler Track', description: 'Obstacle-heavy crawling course for rock and trail crawlers.' },
      { name: 'Sand Track', description: 'Loose sand dunes and berms for desert-style runs.' },
    ];
    for (const track of defaultTracks) {
      await client.query(
        `INSERT INTO rc_tracks (name, description)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [track.name, track.description]
      );
    }

    // Create default main admin if not exists
    const adminCheck = await client.query('SELECT id FROM users WHERE role = $1', ['main_admin']);
    if (adminCheck.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await client.query(
        `INSERT INTO users (username, email, password_hash, full_name, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['admin', 'vishnuprasad1990@gmail.com', hashedPassword, 'Main Administrator', 'main_admin']
      );
      
      console.log('Default admin created:');
      console.log('Username: admin');
      console.log('Password: ' + defaultPassword);
      console.log('Please change the password after first login!');
    }
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
  }
}

migrate()
  .then(() => {
    console.log('Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

