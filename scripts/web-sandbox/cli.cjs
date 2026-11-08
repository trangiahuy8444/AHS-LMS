const fs = require('node:fs');
const path = require('node:path');
function firebaseCliPath() {
  const override = process.env.AHS_SANDBOX_FIREBASE_BIN;
  const candidate = override || path.resolve(__dirname,'../../node_modules/.bin/firebase');
  if (!fs.existsSync(candidate)) throw new Error('Chưa tìm thấy Firebase CLI của dự án.');
  return fs.realpathSync(candidate);
}
async function cliAccessToken() {
  const cli = firebaseCliPath();
  const auth = require(path.resolve(path.dirname(cli),'../auth.js'));
  const account = auth.getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) throw new Error('Cần đăng nhập Firebase CLI bằng tài khoản giáo viên trước khi tạo dữ liệu thử.');
  try {
    const token = await auth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform']);
    if (!token?.access_token) throw new Error('empty');
    return token.access_token;
  } catch {
    throw new Error('Không lấy được quyền truy cập Firebase. Hãy đăng nhập lại Firebase CLI.');
  }
}
module.exports = {firebaseCliPath,cliAccessToken};
