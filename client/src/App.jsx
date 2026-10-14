import React, { useState, useEffect } from 'react';
import LandingView from './components/Landing.jsx';
import AuthView from './components/AuthView.jsx';
import Sidebar from './components/Sidebar.jsx';
import NotesView from './components/NotesView.jsx';
import TasksView from './components/TasksView.jsx';
import FocusView from './components/FocusView.jsx';
import TutorView from './components/TutorView.jsx';
import MernModal from './components/MernModal.jsx';
import { notesAPI, tasksAPI } from './services/api';

const INITIAL_NOTES = [
  {
    id: 'note-1',
    title: 'maths',
    subject: 'Mathematics & Algorithms',
    updatedAt: '3 months ago',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80',
    content: 'i complete my own project details things .\n\n• Binary search on answer space (Aggressive Cows problem)\n• Time complexity: O(N log(max_dist)) where N is number of stalls\n• Verified all 1111/1111 test cases passed in 0.28s.'
  },
  {
    id: 'note-2',
    title: 'Cell Biology - Chapter 4',
    subject: 'Biology',
    updatedAt: '2 days ago',
    image: null,
    content: 'Mitochondria & Cellular Respiration:\n\n• Glycolysis occurs in the cytoplasm and produces 2 ATP and 2 NADH.\n• Krebs Cycle (Citric Acid Cycle) takes place in the mitochondrial matrix.\n• Electron Transport Chain produces roughly 32-34 ATP molecules via oxidative phosphorylation.'
  }
];

const INITIAL_CHATS = [
  {
    id: 'chat-1',
    title: 'New chat',
    updatedAt: '3 months ago',
    messages: []
  }
];

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'auth' | 'app'
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'tasks' | 'focus' | 'tutor'

  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState('note-1');
  const [searchQuery, setSearchQuery] = useState('');

  const [tasks, setTasks] = useState([]);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showMernModal, setShowMernModal] = useState(false);

  useEffect(() => {
    // Attempt fetching from backend if token exists
    const token = localStorage.getItem('study_buddy_token');
    if (token) {
      notesAPI.getAll().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNotes(data);
          setSelectedNoteId(data[0].id || data[0]._id);
        }
      }).catch(() => {});
      tasksAPI.getAll().then((data) => {
        if (Array.isArray(data)) setTasks(data);
      }).catch(() => {});
    }
  }, []);

  const handleUpdateNoteField = (field, value) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === selectedNoteId ? { ...n, [field]: value, updatedAt: 'Just now' } : n))
    );
  };

  const handleCreateNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      subject: '',
      updatedAt: 'Just now',
      image: null,
      content: 'Start writing your lecture notes here...'
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    showToast('Created a new study note');
  };

  const handleDeleteNote = () => {
    if (notes.length <= 1) {
      showToast('You must keep at least one note in your workspace.');
      return;
    }
    const filtered = notes.filter((n) => n.id !== selectedNoteId);
    setNotes(filtered);
    setSelectedNoteId(filtered[0].id);
    showToast('Note deleted');
  };

  const handleAddTask = (taskData) => {
    const newTask = { id: `task-${Date.now()}`, completed: false, ...taskData };
    setTasks([newTask, ...tasks]);
    showToast('Task added');
  };

  const handleToggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task removed');
  };

  const callGeminiTutor = async (promptText) => {
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    const notesContext = notes.map((n) => `Title: ${n.title} (${n.subject})\nContent: ${n.content}`).join('\n---\n');
    const systemPrompt = `You are Study Buddy, a calm, articulate academic tutor. Respond clearly with well-structured study notes, bullet points, or practice quiz questions. Workspace notes context:\n${notesContext}`;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply;
    } catch (e) {}

    return `Here is a breakdown for **"${promptText}"**:\n\n1. **Core Principle:** Focus on understanding the underlying mechanism rather than memorizing isolated terms.\n2. **Review:** Check your current notes to align with exam criteria.`;
  };

  const handleSendMessage = async (text, file) => {
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: text || `Uploaded file: ${file?.name}`,
      attachment: file?.name || null
    };

    const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
    const updatedMessages = [...activeChat.messages, userMessage];
    const updatedTitle = activeChat.messages.length === 0 ? text.slice(0, 28) || 'Study Session' : activeChat.title;

    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, title: updatedTitle, updatedAt: 'Just now', messages: updatedMessages } : c))
    );
    setIsAiLoading(true);

    const aiResponseText = await callGeminiTutor(file ? `${text}\n[Attached File: ${file.name}]` : text);
    const tutorMessage = { id: `msg-${Date.now() + 1}`, role: 'assistant', text: aiResponseText };

    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, messages: [...updatedMessages, tutorMessage] } : c))
    );
    setIsAiLoading(false);
  };

  const handleNewChat = () => {
    const newChat = { id: `chat-${Date.now()}`, title: 'New chat', updatedAt: 'Just now', messages: [] };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#0E2344] font-sans selection:bg-[#F5E6C4] selection:text-[#0E2344]">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0E2344] text-[#FAF8F4] px-4 py-2.5 rounded-xl shadow-lg border border-[#243B61] flex items-center gap-2.5 text-sm animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
          <span>{toast}</span>
        </div>
      )}

      {view === 'landing' && <LandingView onNavigate={(dest) => {
        if (dest === 'auth-signin') { setAuthMode('signin'); setView('auth'); }
        else if (dest === 'auth-signup') { setAuthMode('signup'); setView('auth'); }
        else if (dest === 'app') setView('app');
        else setView('landing');
      }} />}

      {view === 'auth' && <AuthView
        initialIsSignUp={authMode === 'signup'}
        onAuthSuccess={() => { setView('app'); showToast('Signed in successfully'); }}
        onNavigate={(dest) => setView(dest)}
      />}

      {view === 'app' && (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F4]">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenMernModal={() => setShowMernModal(true)}
            onSignOut={() => setView('landing')}
            onNavigate={(dest) => setView(dest)}
          />

          {activeTab === 'notes' && (
            <NotesView
              notes={notes}
              selectedNoteId={selectedNoteId}
              setSelectedNoteId={setSelectedNoteId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onUpdateNote={handleUpdateNoteField}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'focus' && (
            <FocusView notes={notes} tasks={tasks} onShowToast={showToast} />
          )}

          {activeTab === 'tutor' && (
            <TutorView
              chats={chats}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
              onNewChat={handleNewChat}
              onSendMessage={handleSendMessage}
              isAiLoading={isAiLoading}
              activeNote={notes.find((n) => n.id === selectedNoteId)}
            />
          )}
        </div>
      )}

      {showMernModal && <MernModal onClose={() => setShowMernModal(false)} />}
    </div>
  );
}