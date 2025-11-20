import bcrypt from 'bcryptjs';
import pool from '../db/connection';

async function resetAdminPassword() {
  const newPassword = process.argv[2] || 'admin123';
  
  if (newPassword.length < 6) {
    console.error('Password must be at least 6 characters');
    process.exit(1);
  }

  const client = await pool.connect();
  
  try {
    console.log('Resetting admin password...');
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await client.query(
      `UPDATE users 
       SET password_hash = $1 
       WHERE username = 'admin' AND role = 'main_admin'
       RETURNING username, email`,
      [hashedPassword]
    );
    
    if (result.rows.length === 0) {
      console.error('Admin user not found!');
      process.exit(1);
    }
    
    const admin = result.rows[0];
    console.log('✓ Admin password reset successfully!');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('New Password:', newPassword);
    console.log('\nPlease change this password after logging in!');
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

resetAdminPassword();

