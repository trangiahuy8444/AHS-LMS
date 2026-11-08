const {randomBytes} = require('node:crypto');
const {buildSeedDocuments,toFields} = require('../local-sandbox/seed.cjs');
const {cliAccessToken} = require('./cli.cjs');
const PROJECT_ID = 'ahs-lms-sandbox';
const FIRESTORE_ORIGIN = 'https://firestore.googleapis.com';
const BOOTSTRAP_DOC = '_sandbox/bootstrap-web';
function assertWebSandboxTarget({projectId,origin}) {
  if (projectId !== PROJECT_ID || origin !== FIRESTORE_ORIGIN) throw new Error('Thao tác này chỉ được dùng với dự án thử ahs-lms-sandbox.');
}
function buildWebSeedDocuments() {
  const docs = buildSeedDocuments();
  // Chữ thường để khớp cách chuẩn hóa mật khẩu phòng thi của ứng dụng.
  docs['exam_secrets/room'] = {examPassword:randomBytes(24).toString('hex')};
  return docs;
}
async function seedWebSandbox({projectId=PROJECT_ID,origin=FIRESTORE_ORIGIN,getToken=cliAccessToken,fetchImpl=fetch}={}) {
  assertWebSandboxTarget({projectId,origin});
  const token = await getToken();
  if (typeof token !== 'string' || !token) throw new Error('Chưa có quyền tạo dữ liệu thử.');
  const documentsPath = `projects/${projectId}/databases/(default)/documents`;
  const base = `${origin}/v1/${documentsPath}`;
  const headers = {Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
  const marker = await fetchImpl(`${base}/${BOOTSTRAP_DOC}`,{method:'GET',headers});
  if (marker.ok) return {created:false};
  if (marker.status !== 404) throw new Error(`Không đọc được trạng thái khởi tạo dự án thử (HTTP ${marker.status}).`);
  const writes = [];
  for (const [name,value] of Object.entries(buildWebSeedDocuments())) {
    const existing = await fetchImpl(`${base}/${name}`,{method:'GET',headers});
    if (existing.ok) continue;
    if (existing.status !== 404) throw new Error(`Không kiểm tra được dữ liệu thử (HTTP ${existing.status}).`);
    writes.push({update:{name:`${documentsPath}/${name}`,fields:toFields(value)},currentDocument:{exists:false}});
  }
  writes.push({update:{name:`${documentsPath}/${BOOTSTRAP_DOC}`,fields:toFields({ready:true,version:1})},currentDocument:{exists:false}});
  const response = await fetchImpl(`${base}:commit`,{method:'POST',headers,body:JSON.stringify({writes})});
  if (!response.ok) throw new Error(`Không khởi tạo được dữ liệu thử (HTTP ${response.status}). Không ghi đè dữ liệu đã có.`);
  return {created:true,examCount:12};
}
module.exports = {PROJECT_ID,FIRESTORE_ORIGIN,assertWebSandboxTarget,buildWebSeedDocuments,seedWebSandbox};
if (require.main === module) seedWebSandbox().then(result=>console.log(result.created?'Đã tạo 12 đề giả lập. Xem mật khẩu phòng thi trong Cấu hình của admin thử.':'Dự án thử đã có dữ liệu; giữ nguyên cấu hình, mật khẩu và tiến độ.')).catch(error=>{console.error(error.message);process.exitCode=1;});
