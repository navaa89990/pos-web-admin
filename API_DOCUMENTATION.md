# Dokumentasi Lengkap API Endpoint - POS Mobile & Web Admin

Base URL:
- **Produksi (VPS / Coolify)**: `https://web-atmin.my.id`
- **Lokal (Development)**: `http://localhost:3000`

Format Pertukaran Data: `JSON (application/json)`

---

## Daftar Isi
1. [Endpoint Fitur Reset Password (OTP Flow)](#1-endpoint-fitur-reset-password-otp-flow)
   - [POST /api/otp/send - Kirim OTP Reset Password](#11-post-apiotpsend---kirim-otp-reset-password)
   - [POST /api/otp/verify - Verifikasi Kode OTP](#12-post-apiotpverify---verifikasi-kode-otp)
   - [POST /api/otp/reset-password - Simpan Password Baru](#13-post-apiotpreset-password---simpan-password-baru)
2. [Endpoint Mobile POS (Flutter Integration)](#2-endpoint-mobile-pos-flutter-integration)
   - [POST /api/activations/submit - Pengajuan Aktivasi & Bukti Transaksi](#21-post-apiactivationssubmit---pengajuan-aktivasi--upload-bukti)
   - [POST /api/activations/check - Cek Status Aktivasi Perangkat](#22-post-apiactivationscheck---cek-status-aktivasi-perangkat)
3. [Endpoint Otentikasi Admin](#3-endpoint-otentikasi-admin)
   - [POST /api/admin/auth/login - Login Admin](#31-post-apiadminauthlogin---login-administrator)
   - [POST /api/admin/auth/logout - Logout Admin](#32-post-apiadminauthlogout---logout-administrator)
   - [GET /api/admin/auth/me - Cek Sesi Admin](#33-get-apiadminauthme---cek-profil-sesi-admin)
4. [Endpoint Manajemen Data Web Admin](#4-endpoint-manajemen-data-web-admin)
   - [GET /api/admin/stats - Ringkasan Statistik Dashboard](#41-get-apiadminstats---statistik-dashboard)
   - [GET /api/admin/activations - Daftar Permohonan Aktivasi](#42-get-apiadminactivations---daftar-permohonan-aktivasi)
   - [PUT /api/admin/activations - Setujui / Tolak Permohonan](#43-put-apiadminactivations---setujui--tolak-aktivasi)
   - [DELETE /api/admin/activations - Hapus Pengajuan Aktivasi](#44-delete-apiadminactivations---hapus-pengajuan-aktivasi)
   - [GET /api/admin/users - Daftar Pengguna / Merchant](#45-get-apiadminusers---daftar-pengguna-merchant)
   - [PUT /api/admin/users - Perbarui Status Pengguna](#46-put-apiadminusers---perbarui-status-pengguna)
   - [DELETE /api/admin/users - Hapus Pengguna](#47-delete-apiadminusers---hapus-pengguna)
   - [GET /api/admin/notifications - Notifikasi Sistem](#48-get-apiadminnotifications---daftar-notifikasi-sistem)
   - [GET /api/admin/init-db - Inisialisasi Database](#49-get-apiadmininit-db---inisialisasi-database-instan)

---

## 1. Endpoint Fitur Reset Password (OTP Flow)
Alur pengaturan ulang kata sandi (lupa sandi) untuk Administrator Web maupun Pengguna/Merchant aplikasi Mobile POS:

### 1.1. `POST /api/otp/send` - Kirim OTP Reset Password
Mengirimkan 6-digit kode OTP ke email pengguna/admin untuk verifikasi permohonan reset password (masa aktif 5 menit).

- **URL**: `/api/otp/send`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "admin@posmobile.com"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Kode OTP reset password berhasil dikirim ke email."
  }
  ```
- **Response Error (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Email tidak terdaftar dalam sistem."
  }
  ```

---

### 1.2. `POST /api/otp/verify` - Verifikasi Kode OTP
Memvalidasi 6-digit kode OTP yang diterima pengguna. Jika valid, endpoint mengembalikan `resetToken` bertanda tangan JWT (masa berlaku 15 menit) untuk autorisasi ubah sandi.

- **URL**: `/api/otp/verify`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "admin@posmobile.com",
    "otp": "849201"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Kode OTP valid. Silakan buat password baru.",
    "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response Error (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Kode OTP yang dimasukkan salah." 
    // atau: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru."
  }
  ```

---

### 1.3. `POST /api/otp/reset-password` - Simpan Password Baru
Menyimpan kata sandi baru yang telah dienkripsi bcrypt ke database (mendukung akun `admins` maupun `users`). Mendukung otorisasi via `resetToken` atau kode `otp` langsung.

- **URL**: `/api/otp/reset-password`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "admin@posmobile.com",
    "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "newPassword": "passwordBaru123"
  }
  ```
  *(Catatan: Anda juga dapat mengirim `"otp": "849201"` sebagai pengganti `resetToken`)*
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password baru berhasil disimpan. Silakan masuk menggunakan kata sandi baru Anda."
  }
  ```
- **Response Error (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Sesi reset password tidak valid atau telah kedaluwarsa. Silakan minta kode OTP baru."
  }
  ```

---

## 2. Endpoint Mobile POS (Flutter Integration)

### 2.1. `POST /api/activations/submit` - Pengajuan Aktivasi & Upload Bukti
Digunakan saat merchant mengajukan aktivasi aplikasi POS Mobile dengan menyertakan nomor telepon dan foto bukti transaksi/pembayaran.

- **URL**: `/api/activations/submit`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "phone": "081234567890",
    "email": "merchant@gmail.com",
    "proofImageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }
  ```
  *(Catatan: `proofImageBase64` bisa berupa string Base64 gambar lengkap dengan prefix `data:image/...;base64,...` atau link URL gambar).*
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "id": 1,
    "message": "Bukti pembayaran berhasil diterima. Menunggu approval admin."
  }
  ```
- **Response Error (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Akun / perangkat ini sudah disetujui sebelumnya."
  }
  ```

---

### 2.2. `POST /api/activations/check` - Cek Status Aktivasi Perangkat
Dipanggil oleh aplikasi Flutter setiap kali dibuka untuk mengecek apakah perangkat/akun merchant sudah disetujui oleh admin atau masih menunggu.

- **URL**: `/api/activations/check`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "phone": "081234567890",
    "email": "merchant@gmail.com"
  }
  ```
- **Response Sukses - Sudah Disetujui (200 OK)**:
  ```json
  {
    "success": true,
    "status": "activated",
    "details": {
      "id": 1,
      "phone": "081234567890",
      "email": "merchant@gmail.com",
      "status": "disetujui",
      "createdAt": "2026-09-07T12:00:00.000Z",
      "approvedAt": "2026-09-07T12:30:00.000Z"
    }
  }
  ```
- **Response Sukses - Masih Menunggu (200 OK)**:
  ```json
  {
    "success": true,
    "status": "pending",
    "details": { ... }
  }
  ```
- **Response Sukses - Belum Pernah Daftar (200 OK)**:
  ```json
  {
    "success": true,
    "status": "not_registered",
    "message": "Belum ada data pengajuan aktivasi untuk nomor atau email ini."
  }
  ```

---

## 2. Endpoint Otentikasi Admin

### 2.1. `POST /api/admin/auth/login` - Login Administrator
Memvalidasi akun admin, membandingkan password dengan hash Bcrypt, dan memberikan cookie sesi JWT `admin_token` (berlaku 7 hari).

- **URL**: `/api/admin/auth/login`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "admin@posmobile.com",
    "password": "admin123"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login berhasil.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@posmobile.com",
      "role": "admin"
    }
  }
  ```
  *(Header response menyertakan `Set-Cookie: admin_token=...; HttpOnly; Path=/`)*

---

### 2.2. `POST /api/admin/auth/logout` - Logout Administrator
Menghapus cookie sesi `admin_token`.

- **URL**: `/api/admin/auth/logout`
- **Method**: `POST`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logout berhasil."
  }
  ```

---

### 2.3. `GET /api/admin/auth/me` - Cek Profil Sesi Admin
Memvalidasi token JWT aktif dari cookie atau header `Authorization: Bearer <token>`.

- **URL**: `/api/admin/auth/me`
- **Method**: `GET`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@posmobile.com",
      "role": "admin"
    }
  }
  ```

---

## 3. Endpoint Manajemen Data Web Admin

### 3.1. `GET /api/admin/stats` - Statistik Dashboard
Mengembalikan angka riil ringkasan dashboard, data bulanan grafik ApexCharts, dan persentase donat status.

- **URL**: `/api/admin/stats`
- **Method**: `GET`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "stats": {
      "totalUsers": 12,
      "activeActivations": 8,
      "pendingActivations": 3,
      "rejectedActivations": 1,
      "monthlyData": [
        { "bulan": "Jan", "disetujui": 2, "ditolak": 0 },
        { "bulan": "Feb", "disetujui": 4, "ditolak": 1 }
      ],
      "donutSeries": [8, 3, 1],
      "recentStatus": [
        { "id": 1, "nama": "merchant@gmail.com", "waktu": "Hari ini", "status": "disetujui" }
      ]
    }
  }
  ```

---

### 3.2. `GET /api/admin/activations` - Daftar Permohonan Aktivasi
Mengambil seluruh riwayat aktivasi perangkat, termasuk foto bukti transaksi base64.

- **URL**: `/api/admin/activations`
- **Method**: `GET`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "activations": [
      {
        "id": 1,
        "name": "merchant@gmail.com",
        "phone": "081234567890",
        "email": "merchant@gmail.com",
        "proofImage": "data:image/jpeg;base64,...",
        "date": "7 September 2026",
        "status": "pending",
        "createdAt": "2026-09-07T12:00:00.000Z"
      }
    ]
  }
  ```

---

### 3.3. `PUT /api/admin/activations` - Setujui / Tolak Aktivasi
Mengubah status pengajuan aktivasi menjadi `disetujui` atau `ditolak`.
*Catatan Penting: Jika disetujui, sistem otomatis mendaftarkan merchant ke tabel `users` (dengan status `Aktif`) dan mengirimkan email konfirmasi ke merchant via SMTP (Gmail).*

- **URL**: `/api/admin/activations`
- **Method**: `PUT`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "id": 1,
    "status": "disetujui" // pilihan: "disetujui" atau "ditolak"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Permohonan aktivasi berhasil disetujui."
  }
  ```

---

### 4.4. `DELETE /api/admin/activations` - Hapus Pengajuan Aktivasi
Menghapus data permohonan aktivasi dari database berdasarkan ID.

- **URL**: `/api/admin/activations?id=1` *(atau via JSON body `{"id": 1}`)*
- **Method**: `DELETE`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Data pengajuan aktivasi berhasil dihapus."
  }
  ```
- **Response Error (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Data pengajuan aktivasi tidak ditemukan."
  }
  ```

---

### 4.5. `GET /api/admin/users` - Daftar Pengguna / Merchant
Mengambil daftar seluruh merchant yang terdaftar di tabel `users`.

- **URL**: `/api/admin/users`
- **Method**: `GET`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "users": [
      {
        "id": 1,
        "name": "merchant",
        "email": "merchant@gmail.com",
        "phone": "081234567890",
        "status": "Aktif",
        "avatar": "https://ui-avatars.com/api/?name=merchant&background=117554&color=fff",
        "date": "7 Sep 2026"
      }
    ]
  }
  ```

---

### 3.5. `PUT /api/admin/users` - Perbarui Status Pengguna
Mengubah status akun pengguna / merchant.

- **URL**: `/api/admin/users`
- **Method**: `PUT`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "id": 1,
    "status": "Nonaktif" // pilihan: "Aktif", "Pending", "Nonaktif"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Status pengguna berhasil diperbarui menjadi Nonaktif."
  }
  ```

---

### 3.6. `DELETE /api/admin/users` - Hapus Pengguna
Menghapus akun pengguna dari database.

- **URL**: `/api/admin/users?id=1`
- **Method**: `DELETE`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Pengguna berhasil dihapus."
  }
  ```

---

### 3.7. `GET /api/admin/notifications` - Daftar Notifikasi Sistem
Mengambil 50 notifikasi terbaru yang masuk ke panel admin (misal saat ada pengajuan aktivasi baru dari aplikasi mobile).

- **URL**: `/api/admin/notifications`
- **Method**: `GET`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "notifications": [
      {
        "id": 1,
        "category": "Perangkat",
        "title": "Pengajuan Aktivasi: merchant@gmail.com",
        "description": "Nomor HP: 081234567890 mengajukan aktivasi aplikasi mobile POS.",
        "time": "7 Sep, 19:30",
        "unread": true
      }
    ]
  }
  ```

---

### 3.8. `GET /api/admin/init-db` - Inisialisasi Database Instan
Endpoint sekali pakai untuk inisialisasi tabel MySQL dan seeding admin pertama kali secara langsung lewat browser URL.

- **URL**: `/api/admin/init-db?secret=pos_init_2026`
- **Method**: `GET`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "✅ Berhasil! Seluruh tabel database dan akun admin telah terinisialisasi.",
    "credentials": {
      "email": "admin@posmobile.com",
      "passwordDefault": "admin123",
      "note": "Password telah terenkripsi hash Bcrypt di MySQL."
    }
  }
  ```

