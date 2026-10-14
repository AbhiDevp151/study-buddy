import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Circle, Trash2, X } from 'lucide-react';

export default function TasksView({ tasks, onAddTask, onToggleTask, onDeleteTask }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [due, setDue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      subject: subject.trim() || 'General Study',
      due: due.trim() || 'This Week'
    });
    setTitle('');
    setSubject('');
    setDue('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-8 sm:p-12 max-w-5xl overflow-y-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif-editorial text-3xl text-[#0E2344]">Tasks & Schedule</h1>
          <p className="text-sm text-[#636E7E] mt-1">Track assignments, exams, and study sessions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0E2344] hover:bg-[#16315C] text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New task</span>
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="w-full rounded-2xl border border-dashed border-[#DFD9CC] bg-white py-20 px-6 flex flex-col items-center justify-center text-center shadow-2xs">
          <Calendar className="w-10 h-10 text-[#B5BCC6] stroke-[1.7] mb-3" />
          <p className="text-sm text-[#636E7E]">No tasks yet. Add one to start planning your study week.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EAE5DA] divide-y divide-[#F3EFE6] shadow-2xs">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <button onClick={() => onToggleTask(task.id)} className="text-[#0E2344] hover:opacity-80 transition cursor-pointer">
                  {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" /> : <Circle className="w-5 h-5 text-[#8C96A6]" />}
                </button>
                <div>
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-[#8C96A6]' : 'text-[#0E2344]'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-[#6E7785] mt-0.5">
                    {task.subject} • Due {task.due}
                  </p>
                </div>
              </div>

              <button onClick={() => onDeleteTask(task.id)} className="text-[#8C96A6] hover:text-red-600 transition cursor-pointer p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EAE5DA] max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DA]">
              <h3 className="font-serif-editorial text-xl text-[#0E2344]">Add Study Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6E7785] hover:text-[#0E2344]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-[#0E2344] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Finish Calculus Problem Set #3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DDD2] text-sm text-[#0E2344] focus:outline-none focus:border-[#0E2344]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0E2344] mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DDD2] text-sm text-[#0E2344] focus:outline-none focus:border-[#0E2344]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0E2344] mb-1">Due Date</label>
                <input
                  type="text"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  placeholder="e.g. Friday 5 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DDD2] text-sm text-[#0E2344] focus:outline-none focus:border-[#0E2344]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#636E7E] hover:bg-[#F3EFE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0E2344] text-white text-xs font-medium px-5 py-2.5 rounded-xl shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}