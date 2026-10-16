/**
 * Setup XAMPP MySQL database from SQL schema file.
 * Run: node database/setup.js
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const setup = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    const sqlPath = path.join(__dirname, 'mn_tshirt_ecommerce.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Dropping and recreating database from schema...');
    await connection.query('DROP DATABASE IF EXISTS mn_tshirt_ecommerce');
    await connection.query(sql);

    console.log('Database setup complete!');
    console.log('Next: npm run db:seed');
  } finally {
    await connection.end();
  }
};

setup().catch((err) => {
  console.error('Setup failed:', err.message);
  console.error('Make sure XAMPP MySQL is running and .env credentials are correct.');
  process.exit(1);
});
