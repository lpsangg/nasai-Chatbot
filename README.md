# NasAI Empathy Bot

*Chatbot cảm xúc, động viên và trả lời thông tin cá nhân tự động*

![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-4F46E5?style=for-the-badge)

---

## Giới thiệu

NasAI Bot là chatbot cảm xúc, động viên người dùng và trả lời các câu hỏi về thông tin cá nhân, học vấn, kỹ năng, dự án, chứng chỉ... Dữ liệu cá nhân được lưu trong file `frontend/knowledge.json`, các câu hỏi khác sẽ được trả lời bằng AI (OpenRouter).

![Giao diện chatbot](frontend/public/img/nas.png)

---

## Tính Năng Nổi Bật

- **Trả lời tự động thông tin cá nhân**  
  Dựa trên dữ liệu trong `frontend/knowledge.json`.
- **Động viên, trả lời cảm xúc bằng AI**  
  Sử dụng OpenRouter để sinh câu trả lời tích cực.
- **Lưu lịch sử chat**  
  Lưu vào localStorage và MongoDB.
- **Giao diện hiện đại, responsive**  
  Hỗ trợ dark mode, tối ưu cho mobile.

---

## Luồng Hoạt Động

1. **Người dùng nhập tin nhắn**  
   ![Giao diện nhập tin nhắn](frontend/public/placeholder-user.jpg)
2. **Bot kiểm tra câu hỏi**  
   Nếu trùng thông tin cá nhân, trả lời trực tiếp. Nếu không, gọi AI.
3. **Hiển thị lịch sử chat**  
   ![Lịch sử chat](frontend/public/placeholder-logo.png)

---

## Công Nghệ Sử Dụng

- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: API route Next.js, MongoDB
- **AI**: OpenRouter API

---

## Hướng Dẫn Cài Đặt & Deploy

### 1. Clone repo
```bash
git clone https://github.com/lpsangg/nasaiBot.git
cd nasaiBot
```

### 2. Cài đặt dependencies
```bash
cd frontend
pnpm install
```

### 3. Tạo file môi trường
Tạo file `frontend/.env.local` và điền các biến cần thiết (API key, MongoDB URI...).

### 4. Tạo file dữ liệu cá nhân
Tạo file `frontend/knowledge.json` theo mẫu:
```json
{
  "name": "Your Name",
  "skills": ["Skill 1", "Skill 2"],
  "projects": ["Project 1", "Project 2"]
}
```

### 5. Chạy local
```bash
pnpm run dev
```

### 6. Deploy lên Vercel
- Kết nối repo với Vercel.
- Chọn Root Directory là `frontend`.
- Thêm biến môi trường trên Vercel.

---


