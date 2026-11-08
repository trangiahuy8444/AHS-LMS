const {createHash} = require('node:crypto');
const {createRequire} = require('node:module');
const {PROJECT_ID,assertWebSandboxTarget,FIRESTORE_ORIGIN} = require('./seed.cjs');
const {firebaseCliPath,cliAccessToken} = require('./cli.cjs');
const TRIAL_EMAIL = 'admin@ahs-lms-sandbox.invalid';
function firebaseTrialPassword(password) {
  if (typeof password !== 'string' || !password || password.length > 256) throw new Error('Mật khẩu thử không hợp lệ.');
  return createHash('sha256').update(PROJECT_ID+':'+password,'utf8').digest('hex');
}
async function trialAuthClient() {
  let appApi,authApi;
  try {
    const requireSdk = process.env.AHS_SANDBOX_ADMIN_SDK_DIR
      ? createRequire(require('node:path').join(process.env.AHS_SANDBOX_ADMIN_SDK_DIR,'package.json'))
      : createRequire(firebaseCliPath());
    appApi=requireSdk('firebase-admin/app');
    authApi=requireSdk('firebase-admin/auth');
  } catch {
    throw new Error('Chưa tìm thấy Firebase Admin SDK trong bộ công cụ quản trị thử.');
  }
  const appName='ahs-web-sandbox-trial-account';
  let app=appApi.getApps().find(item=>item.name===appName);
  if (app && app.options.projectId !== PROJECT_ID) throw new Error('Ứng dụng xác thực thử không trỏ đúng dự án thử.');
  if (!app) app=appApi.initializeApp({projectId:PROJECT_ID,credential:{getAccessToken:async()=>({access_token:await cliAccessToken(),expires_in:300})}},appName);
  return authApi.getAuth(app);
}
async function provisionTrialAccount({projectId=PROJECT_ID,authClient,getAuthClient=trialAuthClient,password='admin'}={}) {
  assertWebSandboxTarget({projectId,origin:FIRESTORE_ORIGIN});
  const client=authClient || await getAuthClient();
  if (client?.app?.options?.projectId !== PROJECT_ID) throw new Error('Chỉ được tạo tài khoản dùng chung trong dự án thử.');
  let existing;
  try {existing=await client.getUserByEmail(TRIAL_EMAIL);}
  catch(error) {if (error.code !== 'auth/user-not-found') throw new Error('Không kiểm tra được tài khoản thử.');}
  if (existing) {
    // Giữ mật khẩu đã có; chạy lại triển khai không âm thầm đặt lại thông tin đăng nhập.
    if (!existing.emailVerified) {
      try {await client.updateUser(existing.uid,{emailVerified:true});}
      catch {throw new Error('Không xác nhận được trạng thái tài khoản thử.');}
    }
    return {created:false};
  }
  try {
    await client.createUser({email:TRIAL_EMAIL,emailVerified:true,password:firebaseTrialPassword(password),displayName:'AHS-LMS Trial Admin',disabled:false});
  } catch {
    throw new Error('Không tạo được tài khoản dùng chung trên dự án thử.');
  }
  return {created:true};
}
module.exports={TRIAL_EMAIL,firebaseTrialPassword,provisionTrialAccount};
if (require.main===module) provisionTrialAccount().then(result=>console.log(result.created?'Đã tạo tài khoản dùng chung cho website thử.':'Tài khoản thử đã tồn tại; giữ nguyên mật khẩu.')).catch(error=>{console.error(error.message);process.exitCode=1;});
