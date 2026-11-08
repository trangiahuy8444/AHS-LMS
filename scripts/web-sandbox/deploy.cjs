const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {PROJECT_ID,assertWebSandboxTarget,FIRESTORE_ORIGIN} = require('./seed.cjs');
const {firebaseCliPath} = require('./cli.cjs');
const ROOT = path.resolve(__dirname,'../..');
function validateDeployment({projectId,config,marker}) {
  assertWebSandboxTarget({projectId,origin:FIRESTORE_ORIGIN});
  if (config?.firestore?.rules !== 'firestore.web-sandbox.rules' || config?.hosting?.public !== 'dist-sandbox' || config?.hosting?.site !== PROJECT_ID || config?.hosting?.target || config?.hosting?.rewrites?.length) {
    throw new Error('Cấu hình phát hành phải trỏ đúng kho bản dựng và website thử riêng.');
  }
  if (marker?.mode !== 'sandbox-web' || marker?.projectId !== PROJECT_ID) throw new Error('Bản dựng chưa được xác nhận dành riêng cho website thử.');
}
function deployArguments(configPath) {
  return ['deploy','--project',PROJECT_ID,'--config',configPath,'--only','hosting,firestore:rules','--non-interactive'];
}
async function deployWebSandbox() {
  const configPath = path.join(ROOT,'firebase.web-sandbox.json');
  const config = JSON.parse(fs.readFileSync(configPath,'utf8'));
  const markerPath = path.join(ROOT,'dist-sandbox','sandbox-environment.json');
  if (!fs.existsSync(markerPath)) throw new Error('Chưa có bản dựng website thử. Chạy bước tạo bản dựng thử trước.');
  const marker = JSON.parse(fs.readFileSync(markerPath,'utf8'));
  validateDeployment({projectId:PROJECT_ID,config,marker});
  for (const file of ['index.html','admin/index.html','test/index.html']) if (!fs.existsSync(path.join(ROOT,'dist-sandbox',file))) throw new Error('Bản dựng thử chưa đủ các cổng giáo viên và học sinh.');
  const cli = firebaseCliPath();
  const exitCode = await new Promise((resolve,reject)=>{
    const child = spawn(process.execPath,[cli,...deployArguments(configPath)],{cwd:ROOT,stdio:'inherit',env:{...process.env,GCLOUD_PROJECT:PROJECT_ID,GOOGLE_CLOUD_PROJECT:PROJECT_ID}});
    child.once('error',()=>reject(new Error('Không mở được Firebase CLI để phát hành website thử.')));
    child.once('exit',code=>resolve(code ?? 1));
  });
  if (exitCode !== 0) throw new Error('Firebase chưa hoàn tất phát hành website thử.');
  return {projectId:PROJECT_ID};
}
module.exports = {validateDeployment,deployArguments,deployWebSandbox};
if (require.main === module) deployWebSandbox().then(()=>console.log('Đã phát hành website thử riêng ahs-lms-sandbox.')).catch(error=>{console.error(error.message);process.exitCode=1;});
