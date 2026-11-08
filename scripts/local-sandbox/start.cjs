const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const {spawn} = require('node:child_process');
const {seedSandbox,PROJECT_ID} = require('./seed.cjs');
const ROOT = path.resolve(__dirname, '../..');
const PORTS = {auth:9098,firestore:8188,hub:4418,logging:4518};
function validateConfig(config) {
  for (const [name, port] of Object.entries(PORTS)) {
    const entry = config.emulators?.[name];
    if (entry?.host !== '127.0.0.1' || entry?.port !== port) throw new Error(`Bộ mô phỏng ${name} phải dùng 127.0.0.1:${port}.`);
  }
  if (config.emulators?.firestore?.websocketPort !== 9158) throw new Error('Cổng WebSocket thử phải là 9158.');
  if (config.emulators?.ui?.enabled !== false) throw new Error('Giao diện bộ mô phỏng phải tắt trong cấu hình thử.');
}
function freePort(port) {
  return new Promise((resolve,reject) => {
    const server = net.createServer();
    server.once('error', error => reject(new Error(error.code === 'EADDRINUSE'
      ? `Cổng ${port} đang được dùng. Hãy dừng phiên thử cũ hoặc ứng dụng đang dùng cổng này; hệ thống không tự tắt ứng dụng khác.`
      : `Không mở được cổng thử ${port} trên máy này (${error.code || error.message}).`)));
    server.listen({host:'127.0.0.1',port,exclusive:true}, () => server.close(resolve));
  });
}
async function waitForEmulators(child, timeoutMs=180000) {
  const started = Date.now();
  while (Date.now()-started < timeoutMs) {
    if (child.exitCode !== null || child.signalCode !== null || !child.pid) throw new Error('Bộ mô phỏng đã dừng. Kiểm tra Java và Firebase CLI.');
    try {
      const response = await fetch('http://127.0.0.1:4418/emulators', {signal:AbortSignal.timeout(1000)});
      if (response.ok) {
        const emulators = await response.json();
        if (emulators.auth?.port === 9098 && emulators.firestore?.port === 8188) return;
      }
    } catch { /* chờ bộ mô phỏng khởi động */ }
    await new Promise(resolve => setTimeout(resolve,500));
  }
  throw new Error('Bộ mô phỏng chưa sẵn sàng sau 180 giây.');
}
// Các tiến trình được tách nhóm để Ctrl+C ở cửa sổ cha không tới Firebase hai lần.
function createShutdown(children, signalGroup=(pid, signal) => process.kill(pid, signal), markExit=code => {process.exitCode=code;}) {
  let closing = false;
  return {
    isClosing: () => closing,
    stop(code=0) {
      if (closing) return;
      closing = true;
      markExit(code);
      for (const child of children) {
        if (child.exitCode === null && child.pid) {
          try { signalGroup(-child.pid, 'SIGINT'); }
          catch (error) { if (error.code !== 'ESRCH') console.error(error.message); }
        }
      }
    }
  };
}
async function start() {
  validateConfig(JSON.parse(fs.readFileSync(path.join(ROOT,'firebase.sandbox.json'),'utf8')));
  for (const port of [...Object.values(PORTS),9158,5188]) await freePort(port);
  const dataDir = path.join(ROOT,'.local-sandbox','firebase-data');
  fs.mkdirSync(path.dirname(dataDir),{recursive:true});
  const firebaseBin = process.env.AHS_SANDBOX_FIREBASE_BIN || path.join(ROOT,'node_modules','.bin','firebase');
  const viteBin = path.join(path.dirname(require.resolve('vite/package.json')),'bin','vite.js');
  if (!fs.existsSync(firebaseBin)) throw new Error('Thiếu Firebase CLI. Cài gói phát triển của dự án trước khi mở hệ thống thử.');
  const args = ['emulators:start','--only','auth,firestore','--project',PROJECT_ID,'--config',path.join(ROOT,'firebase.sandbox.json'),'--export-on-exit',dataDir];
  if (fs.existsSync(path.join(dataDir,'firebase-export-metadata.json'))) args.push('--import',dataDir);
  const children = [];
  const shutdown = createShutdown(children);
  const stop = shutdown.stop;
  process.on('SIGINT',()=>stop());
  process.on('SIGTERM',()=>stop());
  const emulator = spawn(firebaseBin,args,{cwd:ROOT,stdio:'inherit',detached:true,env:{...process.env,GCLOUD_PROJECT:PROJECT_ID,GOOGLE_CLOUD_PROJECT:PROJECT_ID}});
  children.push(emulator);
  emulator.once('error', error => {console.error(`Không mở được bộ mô phỏng: ${error.message}`); stop(1);});
  emulator.once('exit', code => {if (!shutdown.isClosing()) stop(code || 1);});
  try {
    await waitForEmulators(emulator);
    if (shutdown.isClosing()) return;
    const seeded = await seedSandbox();
    console.log(seeded.created ? 'Đã tạo bộ đề và cấu hình giả lập.' : 'Đang dùng lại dữ liệu thử đã lưu.');
    const vite = spawn(process.execPath,[viteBin,'--mode','sandbox','--host','127.0.0.1','--port','5188','--strictPort'],{cwd:ROOT,stdio:'inherit',detached:true,env:{...process.env,VITE_AHS_SANDBOX_SESSION_ID:String(Date.now())}});
    children.push(vite);
    vite.once('error', error => {console.error(error.message);stop(1);});
    vite.once('exit',code => {if (!shutdown.isClosing()) stop(code || 1);});
    console.log('\nHỆ THỐNG THỬ CỤC BỘ — không dùng dữ liệu học sinh thật');
    console.log('Giáo viên: http://localhost:5188/AHS-LMS/admin/');
    console.log('Học sinh thử: http://127.0.0.1:5188/AHS-LMS/test/');
    console.log('Giữ hai địa chỉ khác nhau để tách phiên đăng nhập. Nhấn Ctrl+C để lưu và dừng.\n');
  } catch(error) { console.error(error.message); stop(1); }
}
module.exports = {createShutdown,validateConfig,freePort,waitForEmulators,start};
if (require.main === module) start().catch(error => {console.error(error.message);process.exitCode=1;});
