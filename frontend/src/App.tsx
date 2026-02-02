import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";

interface Chat {
  id: number;
  title: string;
  messages: any[];
}

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [input, setInput] = useState("");

  const currentChat = chats.find((c) => c.id === currentChatId);

  // ➕ Chat mới
  const newChat = () => {
    const id = Date.now();
    const chat: Chat = { id, title: "", messages: [] };
    setChats([chat, ...chats]);
    setCurrentChatId(id);
    setInput("");
  };

  // 📤 Gửi tin nhắn
  const send = async () => {
    console.log("Gửi tin nhắn:", input);
    if (!input || !currentChat) return;

    const userMsg = { role: "user", text: input };

    // cập nhật user message
    const updatedChats = chats.map((chat) =>
      chat.id === currentChatId
        ? {
            ...chat,
            title: chat.title || input,
            messages: [...chat.messages, userMsg],
          }
        : chat
    );

    setChats(updatedChats);
    setInput("");

    // gọi backend
    const res = await fetch("http://localhost:5001/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    const aiMsg = { role: "ai", text: data.reply };

    setChats((chs) =>
      chs.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, aiMsg] }
          : chat
      )
    );
  };

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={newChat}
        onSelectChat={setCurrentChatId}
      />

      <ChatBox
        messages={currentChat?.messages || []}
        input={input}
        setInput={setInput}
        send={send}
      />
    </div>
  );
}
