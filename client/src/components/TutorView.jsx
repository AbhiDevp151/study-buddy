import React, { useState, useRef } from 'react';
import { Plus, Paperclip, Send, Trash2, X } from 'lucide-react';

export default function TutorView() {
  const [chats, setChats] = useState([
    {
      id: 'chat-1',
      title: 'New chat',
      updatedAt: 'Just now',
      messages: []
    }
  ]);
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleNewChat = () => {
    const newId = 'chat-' + Date.now();
    const newChat = {
      id: newId,
      title: 'New chat',
      updatedAt: 'Just now',
      messages: []
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
  };

  const handleDeleteChat = (id, e) => {
    e.stopPropagation();
    const remaining = chats.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const fresh = { id: 'chat-' + Date.now(), title: 'New chat', updatedAt: 'Just now', messages: [] };
      setChats([fresh]);
      setActiveChatId(fresh.id);
    } else {
      setChats(remaining);
      if (activeChatId === id) {
        setActiveChatId(remaining[0].id);
      }
    }
  };
// Helper to clean up raw markdown asterisks for natural reading
const cleanMarkdownText = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Removes ** bold markers while keeping the text
    .replace(/\*(.*?)\*/g, '$1')     // Removes * italic markers while keeping the text
    .replace(/#{1,6}\s?/g, '');      // Removes markdown header hashes if any
};
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedFile({
        name: file.name,
        mimeType: file.type || 'image/jpeg',
        base64Data: ev.target.result.split(',')[1],
        previewUrl: ev.target.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const sendMessage = async (promptText) => {
    const textToSend = (promptText !== undefined ? promptText : input).trim();
    if (!textToSend && !attachedFile) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: textToSend || 'Analyze this attached file',
      file: attachedFile
    };

    const currentFile = attachedFile;
    setInput('');
    setAttachedFile(null);
    setLoading(true);

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChat.id) return c;
        const newTitle = c.messages.length === 0 ? (textToSend.slice(0, 35) || currentFile?.name || 'Study session') : c.title;
        return {
          ...c,
          title: newTitle,
          updatedAt: 'Just now',
          messages: [...c.messages, userMsg]
        };
      })
    );

    try {
      const token = localStorage.getItem('study_buddy_token');
      const res = await fetch('http://localhost:5000/api/tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMsg.text,
          file: currentFile ? { mimeType: currentFile.mimeType, data: currentFile.base64Data } : null
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Server responded with an error');
      }

      const replyText = data.reply;

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat.id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { id: Date.now() + 1, role: 'assistant', text: replyText }
                ]
              }
            : c
        )
      );
    } catch (err) {
      console.error('Fetch error:', err);
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat.id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { id: Date.now() + 1, role: 'assistant', text: `Error: ${err.message}` }
                ]
              }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-[#FAF8F4] overflow-hidden w-full">
      {/* Left Sidebar: Chat Sessions */}
      <div className="w-72 border-r border-[#E2E8F0] bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E2E8F0]">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 border border-gray-200 rounded-xl flex items-center gap-2 text-sm font-medium text-[#0E2344] hover:bg-gray-50 cursor-pointer"
          >
            <Plus size={16} /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between group border ${
                chat.id === activeChat.id
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-gray-50/60 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-semibold text-[#0E2344] truncate">{chat.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{chat.updatedAt}</p>
              </div>
              <button
                type="button"
                onClick={(e) => handleDeleteChat(chat.id, e)}
                title="Delete Chat"
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg opacity-80 group-hover:opacity-100 transition cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
      

      {/* Right Full-Width Chat Area */}
      <div className="flex-1 flex flex-col bg-[#FAF8F4] overflow-hidden w-full">
        <div className="flex-1 overflow-y-auto p-8">
          {activeChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center w-full px-4 text-center">
              <div className="w-24 h-24 rounded-full bg-amber-100/70 border border-amber-200 flex items-center justify-center mb-6 text-4xl shadow-sm">
                🧑‍🏫
              </div>
              <h2 className="font-serif text-4xl font-bold text-[#0E2344] mb-3">
                How can I help you study?
              </h2>
              <p className="text-gray-500 text-base mb-10 max-w-xl">
                Attach a PDF or image from your device — I can summarize it, build practice tests, or explain concepts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                {[
                  { icon: '📝', label: 'Summarize my notes on...', prompt: 'Summarize the core concepts of my current study topic into key bullet points.' },
                  { icon: '🧪', label: 'Generate a practice test', prompt: 'Create a 5-question multiple choice practice quiz with answers at the end.' },
                  { icon: '💡', label: 'Explain a concept', prompt: 'Explain Binary Search on Answer Space simply with an example.' },
                  { icon: '🗂️', label: 'Create study plan', prompt: 'Create a realistic 5-day study schedule for my upcoming exams.' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(item.prompt)}
                    className="p-5 bg-white rounded-2xl border border-[#E2E8F0] text-left hover:border-[#0E2344] hover:shadow-md transition cursor-pointer"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-semibold text-base text-[#0E2344]">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full px-6 space-y-6">
              {activeChat.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-4xl p-5 rounded-2xl text-base leading-relaxed whitespace-pre-wrap shadow-sm ${
                      m.role === 'user'
                        ? 'bg-[#0E2344] text-white'
                        : 'bg-white border border-[#E2E8F0] text-[#0E2344]'
                    }`}
                  >
                    {m.file && (
                      <div className="mb-3">
                        {m.file.previewUrl && m.file.mimeType.startsWith('image/') && (
                          <img
                            src={m.file.previewUrl}
                            alt={m.file.name}
                            className="max-h-64 rounded-lg mb-2 border border-white/20"
                          />
                        )}
                        <div className="text-xs px-3 py-1.5 rounded bg-white/10 inline-block font-medium">
                          📎 {m.file.name}
                        </div>
                      </div>
                    )}
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-sm text-gray-500 italic pl-2">Study Buddy is thinking...</div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Full-Width Input Area */}
        <div className="p-5 bg-white border-t border-[#E2E8F0] w-full">
          <div className="w-full px-6">
            {attachedFile && (
              <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-[#0E2344]">
                <span>📎 {attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="text-gray-500 hover:text-red-600 cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition"
                title="Attach Image or PDF"
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me to summarize, explain, or quiz you..."
                className="flex-1 px-5 py-3.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:border-[#0E2344] bg-white shadow-inner"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading}
                className="p-3.5 rounded-xl bg-[#0E2344] text-white hover:bg-opacity-90 disabled:opacity-50 cursor-pointer transition shadow-md"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}