import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Explicitly point dotenv to the .env file inside the server folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// 1. Initialize Express app
const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// 3. Connect to MongoDB Compass
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/study-buddy';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Compass successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- Schemas & Models ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);
{
  "name": "server",
  "version": "1.0.0",
  "type": "module",
  "dependencies": { ... }
}
const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  subject: String,
  content: String,
  updatedAt: { type: String, default: 'Just now' }
});
const Note = mongoose.model('Note', noteSchema);

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  category: String,
  dueDate: String,
  completed: { type: Boolean, default: false }
});
const Task = mongoose.model('Task', taskSchema);

const focusSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: Number,
  mode: String,
  noteTitle: String,
  createdAt: { type: Date, default: Date.now }
});
const FocusSession = mongoose.model('FocusSession', focusSchema);

// --- JWT Auth Middleware ---
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret');
    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret');
    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- Notes Routes ---
app.get('/api/notes', verifyJWT, async (req, res) => {
  const notes = await Note.find({ userId: req.user.userId }).sort({ _id: -1 });
  res.json(notes);
});

app.post('/api/notes', verifyJWT, async (req, res) => {
  const note = new Note({ ...req.body, userId: req.user.userId });
  await note.save();
  res.json(note);
});

app.put('/api/notes/:id', verifyJWT, async (req, res) => {
  const updated = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { ...req.body, updatedAt: 'Just now' },
    { new: true }
  );
  res.json(updated);
});

app.delete('/api/notes/:id', verifyJWT, async (req, res) => {
  await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true });
});

// --- Tasks Routes ---
app.get('/api/tasks', verifyJWT, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.userId });
  res.json(tasks);
});

app.post('/api/tasks', verifyJWT, async (req, res) => {
  const task = new Task({ ...req.body, userId: req.user.userId });
  await task.save();
  res.json(task);
});

app.patch('/api/tasks/:id/toggle', verifyJWT, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
  if (task) {
    task.completed = !task.completed;
    await task.save();
  }
  res.json(task);
});

app.delete('/api/tasks/:id', verifyJWT, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true });
});

// --- Focus Sessions Routes ---
app.get('/api/focus', verifyJWT, async (req, res) => {
  const sessions = await FocusSession.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json(sessions);
});

app.post('/api/focus', verifyJWT, async (req, res) => {
  const session = new FocusSession({ ...req.body, userId: req.user.userId });
  await session.save();
  res.json(session);
});

// --- AI Tutor Gemini Endpoint ---
app.post('/api/tutor/chat', verifyJWT, async (req, res) => {
  try {
    const { message, file } = req.body;

    // REPLACE 'AIzaSyYourActualGeminiApiKeyHere' with your real Google AI Studio API key!
  const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.includes('YourActualGeminiApiKey')) {
      return res.status(500).json({ error: 'Please put your real Gemini API key in server.js!' });
    }

   const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', // <-- Update model name here
      systemInstruction: 'You are Study Buddy, a calm, clear, and expert academic tutor helping students study.'
    });

    let promptParts = [message || 'Explain this study concept'];
    
    if (file && file.data) {
      promptParts.push({
        inlineData: {
          mimeType: file.mimeType || 'image/jpeg',
          data: file.data
        }
      });
    }

    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Gemini API Error Detail:', error);
    res.status(500).json({ error: error.message || 'AI Tutor failed to generate a response' });
  }
});

// 4. Start Server (CRITICAL: This opens port 5000 so the frontend can connect)
app.listen(PORT, () => {
  console.log(`Study Buddy server running on http://localhost:${PORT}`);
});