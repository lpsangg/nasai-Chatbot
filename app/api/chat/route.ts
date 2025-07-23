// Đã xoá các import không còn dùng tới
import { connectToDatabase } from "@/lib/mongodb";
import fs from "fs";
import path from "path";

export const maxDuration = 30

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY as string;
const SITE_URL = process.env.SITE_URL || "https://your-site.com";
const SITE_NAME = process.env.SITE_NAME || "Nas Chatbot";

const positive_quotes = [
  "Mỗi ngày là một cơ hội mới để bắt đầu lại.",
  "Hãy luôn tin vào bản thân mình!",
  "Sau cơn mưa trời lại sáng.",
  "Bạn mạnh mẽ hơn bạn nghĩ rất nhiều.",
  "Luôn có ánh sáng ở cuối đường hầm.",
  "Hạnh phúc không phải là đích đến, mà là hành trình.",
  "Chỉ cần bạn không bỏ cuộc, bạn sẽ không thất bại.",
  "Mọi chuyện rồi sẽ ổn thôi!"
];

const system_prompt =
  "Bạn là một trợ lý ảo thân thiện, lịch sự, biết lắng nghe, luôn đồng cảm và hỗ trợ người dùng về mặt cảm xúc. " +
  "Hãy trả lời một cách nhẹ nhàng, động viên, tích cực, sử dụng ngôn ngữ tự nhiên, chuyên nghiệp, tránh dùng các từ như 'Ừ', 'Ờ', 'Nha', 'Nhé' ở đầu câu. " +
  "Nếu nhận thấy người dùng đang có cảm xúc tiêu cực, hãy tự động thêm một câu danh ngôn hoặc trích dẫn tích cực, truyền cảm hứng ở cuối câu trả lời (chỉ thêm 1 câu, không giải thích thêm). Danh ngôn có thể chọn ngẫu nhiên từ: " +
  positive_quotes.join('; ') +
  ". Nếu không tiêu cực thì không cần thêm gì.";

function findKnowledgeAnswer(question: string, knowledge: any[]): string | null {
  const q = question.trim().toLowerCase();
  for (const item of knowledge) {
    if (q === item.question.trim().toLowerCase()) {
      return item.answer;
    }
  }
  return null;
}

function fuzzyIncludes(q: string, arr: string[]) {
  return arr.some(keyword => q.includes(keyword));
}

function mapQuestionToKnowledge(question: string, knowledge: any): string | null {
  const q = question.trim().toLowerCase();

  // Name
  if (fuzzyIncludes(q, ["your name", "bạn tên gì", "tên của bạn"])) {
    return knowledge.personal_info?.full_name || null;
  }
  // University
  if (fuzzyIncludes(q, ["where did you study", "bạn học ở đâu", "trường đại học"])) {
    return knowledge.education?.university || null;
  }
  // Major
  if (fuzzyIncludes(q, ["your major", "chuyên ngành", "ngành học"])) {
    return knowledge.education?.major || null;
  }
  // GPA
  if (fuzzyIncludes(q, ["gpa", "điểm trung bình", "grade point average"])) {
    return knowledge.education?.gpa?.toString() || null;
  }
  // Projects
  if (fuzzyIncludes(q, ["project", "dự án", "các dự án"])) {
    if (Array.isArray(knowledge.projects)) {
      return knowledge.projects.map((p: any) => p.name).join(", ");
    }
  }
  // Email
  if (fuzzyIncludes(q, ["email", "thư điện tử"])) {
    return knowledge.personal_info?.email || null;
  }
  // Phone
  if (fuzzyIncludes(q, ["phone", "số điện thoại", "liên hệ"])) {
    return knowledge.personal_info?.phone || null;
  }
  // Skills
  if (fuzzyIncludes(q, ["skill", "kỹ năng", "programming language", "ngôn ngữ lập trình"])) {
    return knowledge.skills?.programming_languages?.join(", ") || null;
  }
  // Soft skills
  if (fuzzyIncludes(q, ["soft skill", "kỹ năng mềm"])) {
    return knowledge.skills?.soft_skills?.join(", ") || null;
  }
  // Certificates
  if (fuzzyIncludes(q, ["certificate", "chứng chỉ"])) {
    if (Array.isArray(knowledge.certificates)) {
      return knowledge.certificates.map((c: any) => c.name).join(", ");
    }
  }
  // Description
  if (fuzzyIncludes(q, ["describe yourself", "mô tả bản thân", "giới thiệu bản thân"])) {
    return knowledge.preferences?.work_environment || null;
  }
  // Interests
  if (fuzzyIncludes(q, ["interest", "sở thích", "lĩnh vực quan tâm"])) {
    return knowledge.preferences?.interested_fields?.join(", ") || null;
  }
  // Job search status
  if (fuzzyIncludes(q, ["job search", "tìm việc", "đang tìm việc", "cơ hội việc làm"])) {
    return knowledge.preferences?.job_search_status || null;
  }
  // LinkedIn
  if (fuzzyIncludes(q, ["linkedin"])) {
    return knowledge.personal_info?.linkedin || null;
  }
  // Github
  if (fuzzyIncludes(q, ["github"])) {
    return knowledge.personal_info?.github || null;
  }
  // Portfolio
  if (fuzzyIncludes(q, ["portfolio"])) {
    return knowledge.personal_info?.portfolio || null;
  }
  // Graduation year
  if (fuzzyIncludes(q, ["graduation year", "năm tốt nghiệp"])) {
    return knowledge.education?.graduation_year?.toString() || null;
  }
  // Student ID
  if (fuzzyIncludes(q, ["student id", "mã số sinh viên", "mssv"])) {
    return knowledge.education?.student_id || null;
  }
  // Last updated
  if (fuzzyIncludes(q, ["last updated", "cập nhật cuối"])) {
    return knowledge.metadata?.last_updated || null;
  }
  // Add more mappings as bạn muốn...

  return null;
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastUserMsg = messages?.filter((m: any) => m.role === "user").pop();

  // Đọc knowledge.json
  const knowledgePath = path.join(process.cwd(), "knowledge.json");
  let knowledge: any = {};
  try {
    knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf-8"));
  } catch (e) {
    console.error("Không đọc được knowledge.json:", e);
  }

  // Ưu tiên trả lời nếu câu hỏi có trong base knowledge (object mapping)
  if (lastUserMsg) {
    const answer = mapQuestionToKnowledge(lastUserMsg.content, knowledge);
    if (answer) {
      // Lưu prompt vào MongoDB nếu muốn
      try {
        const { db } = await connectToDatabase();
        await db.collection("prompts").insertOne({
          content: lastUserMsg.content,
          createdAt: new Date(),
        });
      } catch (err) {
        console.error("Lỗi lưu prompt vào MongoDB:", err);
      }
      return new Response(JSON.stringify({ reply: answer }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // Lấy lịch sử chat từ messages, chỉ lấy 10 lượt gần nhất
  const history = messages?.slice(-10) || [];
  // Đảm bảo system prompt luôn ở đầu
  const fullMessages = [
    { role: "system", content: system_prompt },
    ...history
  ];

  // Lưu prompt cuối cùng vào MongoDB
  try {
    const { db } = await connectToDatabase();
    const lastUserMsg = messages?.filter((m: any) => m.role === "user").pop();
    if (lastUserMsg) {
      await db.collection("prompts").insertOne({
        content: lastUserMsg.content,
        createdAt: new Date(),
        // Có thể lưu thêm IP, user-agent, session, v.v.
      });
    }
  } catch (err) {
    console.error("Lỗi lưu prompt vào MongoDB:", err);
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "moonshotai/kimi-k2",
      messages: fullMessages,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ reply: `Lỗi: ${error}` }), { status: 500 });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "Lỗi: Không nhận được phản hồi từ AI.";
  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
