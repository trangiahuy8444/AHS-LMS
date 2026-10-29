// Thứ tự nạp giống các thẻ <script> của bản cũ: thư viện -> Firebase -> dữ liệu đề cương -> module lõi
import '../styles/main.css';
import '../shared/globals.js';
import '../core/normalize.js';
import '../core/firebase-config.js';
import '../../data/questions_grade8.js';
import '../../data/questions_grade9.js';
import '../../data/questions_grade10.js';
import '../core/storage-service.js';
import '../core/anti-cheat.js';
import '../core/exam-timer.js';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
