import React, { useState, useEffect, useRef } from 'react';
import { notesAPI } from '../services/api';
import { Plus, Search, Image as ImageIcon, Trash2, Save, Printer, Bold, Italic, List } from 'lucide-react';

export default function NotesView() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await notesAPI.getAll();
      setNotes(data);
      if (data.length > 0) {
        selectNote(data[0]);
      } else {
        // Do not auto-create on login; just reset active note to null
        setActiveNote(null);
        setTitle('');
        setSubject('');
        if (editorRef.current) editorRef.current.innerHTML = '';
      }
    } catch (err) {
      console.error('Failed to load notes', err);
    }
  };

  const selectNote = (note) => {
    setActiveNote(note);
    setTitle(note.title || '');
    setSubject(note.subject || '');
    if (editorRef.current) {
      editorRef.current.innerHTML = note.content || '';
    }
  };

  const handleNewNote = () => {
    const emptyNote = { _id: null, title: '', subject: '', content: '' };
    setActiveNote(emptyNote);
    setTitle('');
    setSubject('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const handleSave = async () => {
    try {
      const htmlContent = editorRef.current ? editorRef.current.innerHTML : '';
      const noteData = {
        title: title.trim() || 'Untitled Note',
        subject: subject.trim() || 'General',
        content: htmlContent
      };

      const noteId = activeNote?._id || activeNote?.id;
      if (noteId && !String(noteId).startsWith('note-')) {
        const updated = await notesAPI.update(noteId, noteData);
        setNotes(notes.map((n) => ((n._id || n.id) === (updated._id || updated.id) ? updated : n)));
        setActiveNote(updated);
      } else {
        const created = await notesAPI.create(noteData);
        setNotes([created, ...notes]);
        setActiveNote(created);
      }
      alert('Note saved to MongoDB!');
    } catch (err) {
      console.error('Failed to save note', err);
      alert('Error saving note. Check if backend has payload size limit set.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await notesAPI.delete(id);
      const remaining = notes.filter((n) => (n._id || n.id) !== id);
      setNotes(remaining);
      if (remaining.length > 0) {
        selectNote(remaining[0]);
      } else {
        setActiveNote(null);
        setTitle('');
        setSubject('');
        if (editorRef.current) editorRef.current.innerHTML = '';
      }
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  const handleLocalImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        if (editorRef.current) {
          editorRef.current.focus();
          const imgHtml = `<div style="margin: 12px 0;"><img src="${base64Url}" alt="${file.name}" style="max-width: 100%; max-height: 420px; border-radius: 12px; border: 1px solid #E2E8F0; display: block;" /></div><p><br/></p>`;
          document.execCommand('insertHTML', false, imgHtml);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleFormat = (command) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, null);
  };

  const filteredNotes = notes.filter(
    (n) =>
      (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#FAF8F4] overflow-hidden w-full">
      {/* Left Sidebar: Notes List */}
      <div className="w-80 border-r border-[#E2E8F0] flex flex-col bg-white shrink-0">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#0E2344]">Notes</h2>
          <button
            onClick={handleNewNote}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E2344] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 cursor-pointer"
          >
            <Plus size={16} /> New
          </button>
        </div>

        <div className="p-3 border-b border-[#E2E8F0]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0E2344]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredNotes.map((note) => {
            const noteId = note._id || note.id;
            const activeId = activeNote?._id || activeNote?.id;
            return (
              <div
                key={noteId}
                onClick={() => selectNote(note)}
                className={`p-3 rounded-xl cursor-pointer transition border flex items-center justify-between group ${
                  activeId === noteId
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif font-bold text-[#0E2344] truncate">
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {note.subject || 'General Study'}
                  </p>
                </div>
                {noteId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(noteId);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No notes yet. Click + New!</div>
          )}
        </div>
      </div>

      {/* Right Area: Rich Note Editor */}
      <div className="flex-1 flex flex-col bg-[#FAF8F4] overflow-hidden w-full">
        {/* Top Toolbar */}
        <div className="p-4 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
          <input
            type="text"
            placeholder="Subject (e.g. Biology, Mathematics)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm w-72 focus:outline-none focus:border-[#0E2344]"
          />

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLocalImageSelect}
              accept="image/*"
              multiple
              className="hidden"
            />

            <button
              type="button"
              onClick={() => handleFormat('bold')}
              title="Bold"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('italic')}
              title="Italic"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('insertUnorderedList')}
              title="Bullet List"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer"
            >
              <List size={16} />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Insert Image from Computer"
              className="px-3 py-1.5 hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer flex items-center gap-1.5 text-sm font-medium border border-gray-200"
            >
              <ImageIcon size={16} /> Image
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              title="Export PDF"
              className="px-3 py-1.5 hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer flex items-center gap-1.5 text-sm font-medium border border-gray-200"
            >
              <Printer size={16} /> PDF
            </button>

            {(activeNote?._id || activeNote?.id) && (
              <button
                type="button"
                onClick={() => handleDelete(activeNote._id || activeNote.id)}
                title="Delete Note"
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0E2344] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 cursor-pointer"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>

        {/* Rich ContentEditable Note Canvas with printable ID */}
        <div
          id="printable-note-area"
          className="flex-1 p-8 overflow-y-auto max-w-4xl w-full mx-auto bg-white shadow-sm my-6 rounded-2xl border border-[#E2E8F0] flex flex-col"
        >
          <input
            type="text"
            placeholder="Note Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full font-serif text-3xl font-bold text-[#0E2344] border-none outline-none mb-4 placeholder-gray-300"
          />

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Start typing your notes here... Click 'Image' above to insert photos from your computer anywhere in your text."
            className="flex-1 w-full outline-none text-gray-800 font-sans leading-relaxed text-base min-h-[350px] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}