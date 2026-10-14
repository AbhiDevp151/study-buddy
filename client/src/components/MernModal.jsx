import React from 'react';
import { X, Code } from 'lucide-react';

export default function MernModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#EAE5DA] max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DA]">
          <h3 className="font-serif-editorial text-xl text-[#0E2344]">MERN Stack Architecture Included</h3>
          <button onClick={onClose} className="text-[#6E7785] hover:text-[#0E2344]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="py-4 space-y-3 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
          <p>
            This application is fully backed by the Node.js + Express + MongoDB REST API provided in <code className="bg-[#FAF8F4] px-1.5 py-0.5 rounded border border-[#E5E0D5] text-[#0E2344] font-mono">server.js</code>.
          </p>
          <ul className="space-y-1.5 list-disc pl-5 text-[#0E2344]">
            <li><strong>MongoDB Schemas:</strong> User, Note, Task, FocusSession, and TutorChat</li>
            <li><strong>JWT Auth Routes:</strong> <code className="font-mono">POST /api/auth/login</code> & <code className="font-mono">/api/auth/register</code></li>
            <li><strong>CRUD Endpoints:</strong> <code className="font-mono">/api/notes</code>, <code className="font-mono">/api/tasks</code>, <code className="font-mono">/api/focus</code></li>
          </ul>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="bg-[#0E2344] text-white text-xs font-medium px-5 py-2.5 rounded-xl">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}