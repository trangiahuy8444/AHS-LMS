/**
 * Nạp thư viện và module lõi theo đúng thứ tự các thẻ <script> cũ, gắn vào window
 * để mã trang (và src/core/*.js dạng UMD) dùng như trước khi chuyển sang Vite.
 */
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';
import html2canvas from 'html2canvas';

window.firebase = firebase;
window.html2canvas = html2canvas;
