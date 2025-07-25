﻿# NasAI Chatbot

### 1. Frontend (UI & Client)
- **Next.js**: Framework React cho SSR/SSG, routing, API routes.
- **React**: Thư viện xây dựng giao diện người dùng.
- **TypeScript**: Ngôn ngữ lập trình có kiểm tra kiểu tĩnh.
- **Tailwind CSS**: Framework CSS tiện dụng, utility-first.
- **Shadcn UI**: Bộ component UI (dựa trên các file trong `components/ui/`).
- **Lucide Icons**: Bộ icon SVG hiện đại (dùng các icon như Bot, User...).
- **Custom Hooks**: `use-mobile`, `use-toast`, ...

### 2. State & Data
- **useState, useEffect (React Hooks)**: Quản lý state, side effect.
- **LocalStorage**: Lưu lịch sử chat phía client.

### 3. Backend (API & Server)
- **Next.js API Route**: Xử lý endpoint `/api/chat`.
- **Node.js**: Môi trường chạy backend (mặc định của Next.js).
- **MongoDB**: Lưu trữ prompt/chat log (kết nối qua file `lib/mongodb.ts`).
- **Upstash Redis**: Dùng cho rate limiting (giới hạn số lần gọi API).
- **@upstash/ratelimit, @upstash/redis**: Thư viện JS để kết nối và thực hiện rate limit với Upstash.

### 4. AI & Chatbot
- **OpenRouter AI**: Dịch vụ AI trả lời hội thoại, tương thích OpenAI API.
- **Streaming API**: Trả về dữ liệu dạng stream (`text/event-stream`) cho trải nghiệm chat mượt mà.

### 5. Build & Tooling
- **pnpm**: Trình quản lý package (thay thế npm/yarn).
- **PostCSS**: Xử lý CSS (dùng với Tailwind).
- **TypeScript Compiler (tsc)**: Kiểm tra type, build code.
- **ESLint/Prettier** (có thể có): Lint/format code.

### 6. Khác
- **.env**: Quản lý biến môi trường (API key, Upstash URL/token...).
- **Vercel/Netlify** (nếu deploy): Hosting serverless cho Next.js.
