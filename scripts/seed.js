/* eslint-disable @typescript-eslint/no-require-imports */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const dbUrl = process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1:3306/pos_mobile';
  console.log('Menghubungkan ke database MySQL...');

  try {
    const parsedUrl = new URL(dbUrl);
    const dbName = parsedUrl.pathname.replace(/^\//, '') || 'pos_mobile';

    // Buat database jika belum ada
    const rootUrl = `${parsedUrl.protocol}//${parsedUrl.username}:${parsedUrl.password}@${parsedUrl.host}`;
    const initialConn = await mysql.createConnection(rootUrl);
    await initialConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await initialConn.end();
  } catch (err) {
    console.log('Info: Melewati inisialisasi root DB (menggunakan koneksi langsung):', err.message);
  }

  const connection = await mysql.createConnection(dbUrl);

  try {
    console.log('Membuat tabel jika belum ada...');

    // 1. Tabel Admins
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabel Users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(30) NULL,
        status ENUM('Aktif', 'Pending', 'Nonaktif') DEFAULT 'Pending',
        avatar TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 3. Tabel Activations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(150) NOT NULL,
        proof_image LONGTEXT NULL,
        status ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 4. Tabel Otps
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Tabel Notifications
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(50) DEFAULT 'Transaksi',
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        is_unread BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Hash password admin123 menggunakan bcrypt
    console.log('Menghasilkan hash password admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Seed data admin dengan hashed password
    console.log('Seeding data admin...');
    await connection.query(
      `
      INSERT INTO admins (name, email, password, role) 
      VALUES ('Administrator', 'admin@posmobile.com', ?, 'admin')
      ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password);
    `,
      [hashedPassword]
    );

    console.log('✅ Seed berhasil! Akun admin tersimpan dengan password ter-hash bcrypt.');
  } catch (error) {
    console.error('❌ Gagal melakukan seed:', error);
  } finally {
    await connection.end();
  }
}

seed();
