/**
 * Nạp Firebase compat từ npm và gắn vào window để src/core/*.js (dạng UMD) dùng như trước khi chuyển sang Vite.
 * Không nạp Firebase Analytics: không dùng tới, và không thu thập dữ liệu sử dụng của học sinh.
 * html2canvas chỉ tải khi học sinh bấm chụp ảnh kết quả (student/actions/captureActions.js).
 */
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

window.firebase = firebase;
