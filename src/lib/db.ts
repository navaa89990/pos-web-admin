import mysql from 'mysql2/promise';

// Buat pool koneksi MySQL menggunakan DATABASE_URL dari environment
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1:3306/pos_mobile',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

