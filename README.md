# 🛒 TechZone - E-commerce Web Application

![MERN Stack](https://img.shields.io/badge/Stack-MERN-success?style=for-the-badge&logo=react)
![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%26%20Render-blue?style=for-the-badge)

**TechZone** là một nền tảng thương mại điện tử (E-commerce) Full-stack hiện đại, cung cấp trải nghiệm mua sắm trực tuyến mượt mà. Dự án được xây dựng theo kiến trúc **MERN Stack** (MongoDB, Express, React, Node.js) và đã được triển khai thực tế trên môi trường Cloud.

<img width="1892" height="902" alt="image" src="https://github.com/user-attachments/assets/bdd1d89c-74c1-4e3c-b8e9-df3253996c9e" />
<img width="1900" height="910" alt="image" src="https://github.com/user-attachments/assets/2cc6c701-ee20-4a67-8e10-b4165de1d362" />
<img width="1897" height="826" alt="image" src="https://github.com/user-attachments/assets/f0892422-ee7e-4c36-a210-7e2720f8b593" />
<img width="558" height="720" alt="image" src="https://github.com/user-attachments/assets/1e6725c7-f798-4731-ad29-c3249849a1c9" />




---

## 🔗 Live Demo (Dùng thử)

Trải nghiệm dự án tại đây:
- **🏠 Frontend (Giao diện):** [https://techzone-project.vercel.app](https://tech-zone-project.vercel.app)
- **⚙️ Backend (API):** [https://techzone-project.onrender.com](https://techzone-project.onrender.com)

---

## 🛠 Công nghệ sử dụng (Tech Stack)

Dự án sử dụng các công nghệ mới nhất để đảm bảo hiệu suất và khả năng mở rộng:

### 💻 Frontend (Client)
- **React.js (Vite):** Library xây dựng giao diện người dùng tốc độ cao.
- **React Router DOM:** Quản lý điều hướng (Routing).
- **Axios:** Xử lý HTTP Requests tới Server.
- **CSS / Styled-components:** Thiết kế giao diện Responsive.

### 🔌 Backend (Server)
- **Node.js:** Môi trường chạy JavaScript phía Server.
- **Express.js:** Framework xây dựng RESTful API mạnh mẽ.
- **Mongoose:** ODM để làm việc với MongoDB.
- **JSON Web Token (JWT):** Cơ chế xác thực và bảo mật người dùng.
- **Bcryptjs:** Mã hóa mật khẩu an toàn.
- **Dotenv:** Quản lý biến môi trường.

### 🗄️ Database (Cơ sở dữ liệu)
- **MongoDB Atlas:** Cơ sở dữ liệu NoSQL đám mây (Cloud Database).

### 🚀 Deployment (Triển khai)
- **Frontend Hosting:** Vercel.
- **Backend Hosting:** Render.
- **Database Hosting:** MongoDB Atlas (AWS Region Singapore).

---

## ✨ Tính năng chính (Features)

### 👤 Người dùng (Customer)
- [x] **Authentication:** Đăng ký, Đăng nhập (Bảo mật JWT).
- [x] **Duyệt sản phẩm:** Xem danh sách, chi tiết sản phẩm, lọc sản phẩm.
- [x] **Giỏ hàng:** Thêm/Sửa/Xóa sản phẩm trong giỏ hàng.
- [x] **Đặt hàng:** Thanh toán và tạo đơn hàng.
- [x] **Lịch sử:** Xem lại các đơn hàng đã mua.

### 🛡️ Quản trị viên (Admin)
- [x] Quản lý danh sách sản phẩm (Thêm, Sửa, Xóa).
- [x] Quản lý đơn hàng của khách.
- [x] Quản lý người dùng.

---

## ⚙️ Hướng dẫn Cài đặt & Chạy trên máy (Installation)

Nếu bạn muốn chạy source code này trên máy tính cá nhân (Localhost), hãy làm theo các bước sau:

### 1. Clone dự án về máy

git clone [https://github.com/DungStudyCode/TechZone-Project.git](https://github.com/DungStudyCode/TechZone-Project.git)
cd TechZone-Project

2. Cài đặt & Cấu hình Backend (Server)
Di chuyển vào thư mục server và cài đặt thư viện:
cd server
npm install
Cấu hình biến môi trường: Tạo file .env trong thư mục server và điền thông tin của bạn:

PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/techzone
JWT_SECRET=ma_bi_mat_cua_ban

Chạy Server:
npm run dev
# Server sẽ chạy tại: http://localhost:5000
3. Cài đặt & Cấu hình Frontend (Client)
Mở một Terminal mới (không tắt Terminal server):
cd client
npm install

Cấu hình API Endpoint: Mở file cấu hình axios (ví dụ src/services/api.js) và đảm bảo trỏ về localhost:
baseURL: 'http://localhost:5000/api'

Chạy Client:
npm run dev

# Website sẽ chạy tại: http://localhost:5173

📂 Cấu trúc thư mục (Folder Structure)

        TechZone-Project/
        ├── client/                 # Mã nguồn Frontend (ReactJS)
        │   ├── public/             # Tài nguyên tĩnh
        │   ├── src/
        │   │   ├── components/     # Các thành phần tái sử dụng (Header, Footer...)
        │   │   ├── pages/          # Các trang chính (Home, Product, Cart...)
        │   │   ├── services/       # Cấu hình gọi API (Axios)
        │   │   └── App.jsx
        │   └── package.json
        │
        ├── server/                 # Mã nguồn Backend (NodeJS)
        │   ├── config/             # Cấu hình DB
        │   ├── controllers/        # Xử lý logic
        │   ├── models/             # Định nghĩa Schema MongoDB
        │   ├── routes/             # Định nghĩa API Routes
        │   ├── index.js            # File chạy chính
        │   └── package.json
        │
        └── README.md

👨‍💻 Tác giả (Author)
DungStudyCode

🐙 GitHub: https://github.com/DungStudyCode

🤝 Đóng góp
Mọi ý kiến đóng góp hoặc báo lỗi đều được hoan nghênh. Vui lòng tạo Issue hoặc Pull Request.
⭐️ Nếu thấy dự án hữu ích, hãy tặng mình 1 sao (Star) nhé!


