# Dokumentasi Lengkap API Endpoint - POS Mobile & Web Admin

Base URL:
- **Produksi (VPS / Coolify)**: `http://ykvthgrih3nrip9g3w9p8qls.54.163.124.13.sslip.io` (atau domain kustom Anda)
- **Lokal (Development)**: `http://localhost:3000`

Format Pertukaran Data: `JSON (application/json)`

---

## Daftar Isi
1. [Endpoint Mobile POS (Flutter Integration)](#1-endpoint-mobile-pos-flutter-integration)
   - [POST /api/otp/send - Kirim OTP Email](#11-post-apiotpsend---kirim-otp-ke-email)
   - [POST /api/otp/verify - Verifikasi Kode OTP](#12-post-apiotpverify---verifikasi-kode-otp)
   - [POST /api/activations/submit - Pengajuan Aktivasi & Bukti Transaksi](#13-post-apiactivationssubmit---pengajuan-aktivasi--upload-bukti)
   - [POST /api/activations/check - Cek Status Aktivasi](#14-post-apiactivationscheck---cek-status-aktivasi-perangkat)
2. [Endpoint Otentikasi Admin](#2-endpoint-otentikasi-admin)
   - [POST /api/admin/auth/login - Login Admin](#21-post-apiadminauthlogin---login-administrator)
   - [POST /api/admin/auth/logout - Logout Admin](#22-post-apiadminauthlogout---logout-administrator)
   - [GET /api/admin/auth/me - Cek Sesi Admin](#23-get-apiadminauthme---cek-profil-sesi-admin)
3. [Endpoint Manajemen Data Web Admin](#3-endpoint-manajemen-data-web-admin)
   - [GET /api/admin/stats - Ringkasan Statistik Dashboard](#31-get-apiadminstats---statistik-dashboard)
   - [GET /api/admin/activations - Daftar Permohonan Aktivasi](#32-get-apiadminactivations---daftar-permohonan-aktivasi)
   - [PUT /api/admin/activations - Setujui / Tolak Permohonan](#33-put-apiadminactivations---setujui--tolak-aktivasi)
   - [GET /api/admin/users - Daftar Pengguna / Merchant](#34-get-apiadminusers---daftar-pengguna-merchant)
   - [PUT /api/admin/users - Perbarui Status Pengguna](#35-put-apiadminusers---perbarui-status-pengguna)
   - [DELETE /api/admin/users - Hapus Pengguna](#36-delete-apiadminusers---hapus-pengguna)
   - [GET /api/admin/notifications - Notifikasi Sistem](#37-get-apiadminnotifications---daftar-notifikasi-sistem)
   - [GET /api/admin/init-db - Inisialisasi Database](#38-get-apiadmininit-db---inisialisasi-database-instan)

---

## 1. Endpoint Mobile POS (Flutter Integration)

### 1.1. `POST /api/otp/send` - Kirim OTP ke Email
Digunakan oleh aplikasi Flutter saat registrasi/verifikasi awal untuk mengirimkan kode OTP 6-digit ke email merchant via Resend.

- **URL**: `/api/otp/send`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "merchant@gmail.com"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Kode OTP berhasil dikirim ke email Anda."
  }
  ```
- **Response Error (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Email wajib diisi."
  }
  ```

---

### 1.2. `POST /api/otp/verify` - Verifikasi Kode OTP
Memvalidasi kode OTP 6-digit yang dimasukkan merchant di aplikasi Flutter. Masa berlaku OTP adalah 5 menit.

- **URL**: `/api/otp/verify`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "merchant@gmail.com",
    "otp": "582194"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "OTP valid dan terverifikasi."
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

### 1.3. `POST /api/activations/submit` - Pengajuan Aktivasi & Upload Bukti
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

### 1.4. `POST /api/activations/check` - Cek Status Aktivasi Perangkat
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
*Catatan Penting: Jika disetujui, sistem otomatis mendaftarkan merchant ke tabel `users` (dengan status `Aktif`) dan mengirimkan email konfirmasi ke merchant via Resend.*

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

### 3.4. `GET /api/admin/users` - Daftar Pengguna / Merchant
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
