import React from 'react';
import { BookOpen, Calendar, Clock, MessageSquare, Code, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenMernModal, onSignOut, onNavigate }) {
  return (
    <aside className="w-full md:w-[240px] bg-[#0B1F3F] text-white flex flex-col justify-between shrink-0 border-r border-[#172E54]">
      <div>
        <div onClick={() => onNavigate('landing')} className="px-5 py-6 flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-[#EAB308] flex items-center justify-center text-[#0B1F3F] font-serif-editorial font-bold text-lg shadow-xs">
            S
          </div>
          <span className="font-serif-editorial text-lg font-medium text-white tracking-wide">
            Study Buddy
          </span>
        </div>

        <nav className="px-3 space-y-1.5 mt-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
              activeTab === 'notes' ? 'bg-[#1C3259] text-white' : 'text-[#A6B4C9] hover:text-white hover:bg-[#142749]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
              activeTab === 'tasks' ? 'bg-[#1C3259] text-white' : 'text-[#A6B4C9] hover:text-white hover:bg-[#142749]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('focus')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
              activeTab === 'focus' ? 'bg-[#1C3259] text-white' : 'text-[#A6B4C9] hover:text-white hover:bg-[#142749]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Focus</span>
          </button>

          <button
            onClick={() => setActiveTab('tutor')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
              activeTab === 'tutor' ? 'bg-[#1C3259] text-white' : 'text-[#A6B4C9] hover:text-white hover:bg-[#142749]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Tutor</span>
          </button>
        </nav>
      </div>

      <div className="border-t border-[#1A3054] p-3 space-y-1">
        <button
          onClick={onOpenMernModal}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#95A5BD] hover:text-white hover:bg-[#142749] transition cursor-pointer"
        >
          <Code className="w-3.5 h-3.5 text-[#EAB308]" />
          <span>MERN API Status: Ready</span>
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-[#A6B4C9] hover:text-white hover:bg-[#142749] transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}