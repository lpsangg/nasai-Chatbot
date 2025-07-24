"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User, Sparkles } from "lucide-react"

type Message = { role: "user" | "assistant"; content: string; id: string };

export default function ModernChatbot() {
  // const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Khôi phục lịch sử chat từ localStorage khi load trang
  useEffect(() => {
    const saved = localStorage.getItem("chatHistory")
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((msg: any) => ({
          ...msg,
          role: msg.role === 'user' ? 'user' : 'assistant'
        }))
        setMessages(parsed)
      } catch {}
    }
  }, [])

  // Lưu lịch sử chat vào localStorage mỗi khi messages thay đổi
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages))
  }, [messages])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const userMsg = input.trim()
    if (!userMsg) return
    setIsLoading(true)
    setMessages(prev => {
      const newMsgs = [...prev, { role: 'user' as const, content: userMsg, id: Date.now() + "-user" }]
      localStorage.setItem("chatHistory", JSON.stringify(newMsgs))
      return newMsgs
    })
    setInput("")
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: userMsg }] })
      })
      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        // Xử lý stream
        const reader = res.body!.getReader();
        let assistantMsg = "";
        setMessages(prev => {
          const newMsgs = [...prev, { role: 'assistant' as const, content: "", id: Date.now() + "-bot" }];
          localStorage.setItem("chatHistory", JSON.stringify(newMsgs))
          return newMsgs;
        });
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = new TextDecoder().decode(value);
            // Xử lý từng dòng trong chunk
            chunk.split('\n').forEach(line => {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (dataStr && dataStr !== '[DONE]') {
                  try {
                    const data = JSON.parse(dataStr);
                    const delta = data.choices?.[0]?.delta?.content;
                    if (delta) {
                      assistantMsg += delta;
                      setMessages(prev => {
                        // Cập nhật content của assistant message cuối cùng
                        const newMsgs = [...prev];
                        for (let i = newMsgs.length - 1; i >= 0; i--) {
                          if (newMsgs[i].role === 'assistant') {
                            newMsgs[i] = { ...newMsgs[i], content: assistantMsg };
                            break;
                          }
                        }
                        localStorage.setItem("chatHistory", JSON.stringify(newMsgs))
                        return newMsgs;
                      });
                    }
                  } catch {}
                }
              }
            });
          }
        }
      } else {
        // Xử lý JSON thông thường (cache)
        const data = await res.json()
        setMessages(prev => {
          const newMsgs = [...prev, { role: 'assistant' as const, content: data.reply, id: Date.now() + "-bot" }]
          localStorage.setItem("chatHistory", JSON.stringify(newMsgs))
          return newMsgs
        })
      }
    } catch (e) {
      setMessages(prev => {
        const newMsgs = [...prev, { role: 'assistant' as const, content: "Lỗi kết nối server.", id: Date.now() + "-err" }]
        localStorage.setItem("chatHistory", JSON.stringify(newMsgs))
        return newMsgs
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-purple-200 dark:border-purple-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500">
                <AvatarImage src="/img/nas.png" alt="Bot Avatar" />
                <AvatarFallback className="bg-transparent">
                  {/* fallback nếu không load được ảnh */}
                  <Bot className="h-6 w-6 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Nas
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLoading ? "Tui đang trả lời..." : "Bạn ổn khummm"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="h-[calc(100vh-200px)] flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-200 dark:border-purple-800 shadow-xl">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500">
                  <img src="/img/nas.png" alt="Bot Avatar" className="w-16 h-16 object-cover" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Chào mừng bạn đến với Nas nènn!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Chào bạn, mình là Nas. Hãy thoải mái tâm sự, mình luôn ở đây để lắng nghe và đồng hành cùng bạn.

                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500 flex-shrink-0">
                    <AvatarImage src="/img/nas.png" alt="Bot Avatar" />
                    <AvatarFallback className="bg-transparent">
                      <Bot className="h-5 w-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white ml-auto"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md border border-purple-100 dark:border-purple-800"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 bg-gradient-to-r from-green-500 to-teal-500 flex-shrink-0">
                    <AvatarFallback className="bg-transparent">
                      <User className="h-5 w-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-2">
                <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500">
                  <AvatarImage src="/img/nas.png" alt="Bot Avatar" />
                  <AvatarFallback className="bg-transparent">
                    <Bot className="h-5 w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3 shadow-md border border-purple-100 dark:border-purple-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-purple-200 dark:border-purple-800 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <form onSubmit={onSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="pr-12 bg-white dark:bg-gray-700 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-full py-3 px-4"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full px-6 py-3 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
