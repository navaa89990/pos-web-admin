import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Validasi secret untuk keamanan
    const validSecret = process.env.JWT_SECRET || 'pos_mobile_super_secret_jwt_key_2026_x89a';
    const allowedSecrets = [
      validSecret,
      'pos_init_2026',
      'vt90U11ivdtO0v1dFwmm9V7zlFrlji9BjBgMZ8O4E232wU0YG1mflRnMQ8pS5HgY',
      'mijP2b6GKjC1R4e5hA88GQEEzxK4ZAGg4bqv4ix4M2exUQ9t0Q7R4FUKWTD61AXj'
    ];

    if (!secret || !allowedSecrets.includes(secret)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Akses ditolak. Silakan sertakan parameter ?secret=pos_init_2026 yang valid di URL.' 
        },
        { status: 401 }
      );
    }

    // 1. Tabel Admins
    await pool.query(`
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NULL,
        phone VARCHAR(30) NULL,
        status ENUM('Aktif', 'Pending', 'Nonaktif') DEFAULT 'Pending',
        avatar TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Pastikan kolom password ada di tabel users (jika tabel sudah pernah dibuat sebelumnya)
    try {
      await pool.query('ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL AFTER email');
    } catch {
      // Kolom sudah ada
    }

    // 3. Tabel Activations
    await pool.query(`
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Tabel Notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(50) DEFAULT 'Transaksi',
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        is_unread BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed Akun Administrator
    const hashedPassword = await hashPassword('admin123');
    await pool.query(
      `
      INSERT INTO admins (name, email, password, role) 
      VALUES ('Administrator', 'admin@posmobile.com', ?, 'admin')
      ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password);
      `,
      [hashedPassword]
    );

    return NextResponse.json({
      success: true,
      message: '✅ Berhasil! Seluruh tabel database dan akun admin telah terinisialisasi.',
      credentials: {
        email: 'admin@posmobile.com',
        passwordDefault: 'admin123',
        note: 'Password telah terenkripsi hash Bcrypt di MySQL.',
      },
    });
  } catch (error) {
    console.error('Error saat inisialisasi database:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal inisialisasi database. Pastikan koneksi DATABASE_URL benar.', 
        error: message 
      },
      { status: 500 }
    );
  }
}

