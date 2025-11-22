import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL (Fly.io/Supabase) or DB_URL if provided, otherwise use individual env vars
let poolConfig: pg.PoolConfig;

const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL;

if (databaseUrl) {
  console.log('Using database connection string (DATABASE_URL or DB_URL)');
  // Fly.io, Supabase, and other cloud databases require SSL
  poolConfig = { 
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  };
} else {
  console.log('Using individual DB env vars');
  // Only enable SSL in production for individual env vars
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'rc_cafe',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
}

console.log('Database config:', {
  hasDbUrl: !!databaseUrl,
  dbUrlPreview: databaseUrl ? `${databaseUrl.substring(0, 30)}...` : 'not set',
  usingConnectionString: !!poolConfig.connectionString,
  host: (poolConfig as any).host || 'N/A (using connectionString)',
  sslEnabled: !!poolConfig.ssl,
});

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', error);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout of 5 seconds
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);
  
  client.release = () => {
    clearTimeout(timeout);
    return release();
  };
  
  return client;
};

export default pool;

