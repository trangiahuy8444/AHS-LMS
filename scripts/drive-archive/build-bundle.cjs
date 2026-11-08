const fs = require('node:fs');
const path = require('node:path');
function dispatcherSource(projects,settings) {
  return `
// Một lịch và một lần cấp quyền; trạng thái của từng dự án được tách riêng.
var AHS_ARCHIVE_PROJECTS = ${JSON.stringify(projects)};
var AHS_ARCHIVE_SHARED_SETTINGS = ${JSON.stringify(settings)};
function ahsSelectArchiveProject(projectId,budgetMs) {
  if (AHS_ARCHIVE_PROJECTS.indexOf(projectId) < 0) throw new Error('archive_project_invalid');
  AHS_ARCHIVE_SETTINGS = Object.assign({},AHS_ARCHIVE_SHARED_SETTINGS,{projectId:projectId,manageTrigger:false,runInitial:false,activateDeletionProtection:false,runBudgetMs:budgetMs || 105000});
  AHS_ARCHIVE_CONFIG_KEY = 'AHS_ARCHIVE_CONFIG_V1:'+projectId;
  AHS_ARCHIVE_CURSOR_KEY = 'AHS_ARCHIVE_CURSOR_V1:'+projectId;
  AHS_ARCHIVE_BACKFILL_KEY = 'AHS_ARCHIVE_BACKFILL_V1:'+projectId;
}
function installDriveArchive() {
  AHS_ARCHIVE_PROJECTS.forEach(function(projectId) {
    ahsSelectArchiveProject(projectId);
    installDriveArchiveForProject();
  });
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'runDriveArchive') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('runDriveArchive').timeBased().everyMinutes(5).create();
  // Mỗi dự án ghi trạng thái tự động sau khi lịch chung sẵn sàng.
  // Cờ bảo vệ xóa chỉ được bật riêng khi người bảo trì chủ động yêu cầu.
  AHS_ARCHIVE_PROJECTS.forEach(function(projectId) {
    ahsSelectArchiveProject(projectId);
    ahsEnableArchive(ahsArchiveConfig(),AHS_ARCHIVE_SHARED_SETTINGS.activateDeletionProtection === true);
  });
  runDriveArchive();
}
function runDriveArchive() {
  var started=Date.now(),failures=0;
  AHS_ARCHIVE_PROJECTS.forEach(function(projectId,index) {
    var remaining=210000-(Date.now()-started);
    if (remaining < 1000) return;
    ahsSelectArchiveProject(projectId,Math.floor(remaining/(AHS_ARCHIVE_PROJECTS.length-index)));
    try {runDriveArchiveForProject();}
    catch (error) {failures++;}
  });
  if (failures) throw new Error('Một môi trường chưa hoàn tất lưu Drive. Kiểm tra trạng thái riêng trong admin.');
}
function backfillDriveArchive() {
  AHS_ARCHIVE_PROJECTS.forEach(function(projectId) {
    ahsSelectArchiveProject(projectId);
    backfillDriveArchiveForProject();
  });
}
`;
}
function projectFiles({projectId='ahs-lms-sandbox',projects,schoolYear='2026-2027',period='GK1',rootFolderId,activateDeletionProtection=false}={}) {
  const targets=projects || [projectId];
  if (!Array.isArray(targets) || !targets.length || targets.length>2 || new Set(targets).size!==targets.length || targets.some(id=>!['ahs-lms','ahs-lms-sandbox'].includes(id)) || !/^\d{4}-\d{4}$/.test(schoolYear) || !/^[A-Za-z0-9_-]{1,30}$/.test(period) || typeof activateDeletionProtection !== 'boolean') throw new Error('Cấu hình bộ lưu trữ không hợp lệ.');
  if (rootFolderId !== undefined && !/^[A-Za-z0-9_-]{10,}$/.test(rootFolderId)) throw new Error('Thư mục lưu trữ riêng không hợp lệ.');
  const settings={projectId:targets[0],schoolYear,period,activateDeletionProtection,...(rootFolderId ? {rootFolderId} : {})};
  const declaration=`var AHS_ARCHIVE_SETTINGS = ${JSON.stringify(settings)};`;
  let code=fs.readFileSync(path.join(__dirname,'Code.gs'),'utf8').replace(/^var AHS_ARCHIVE_SETTINGS = .*;$/m,declaration);
  if (projects) {
    code=code.replace('function installDriveArchive()', 'function installDriveArchiveForProject()')
      .replace('function runDriveArchive()', 'function runDriveArchiveForProject()')
      .replace('function backfillDriveArchive()', 'function backfillDriveArchiveForProject()')
      .replace(/\brunDriveArchive\(\);/g,'runDriveArchiveForProject();');
    code+=dispatcherSource(targets,{schoolYear,period,activateDeletionProtection,...(rootFolderId ? {rootFolderId} : {})});
  }
  return [
    {name:'ArchiveEngine',type:'SERVER_JS',source:fs.readFileSync(path.join(__dirname,'ArchiveEngine.js'),'utf8')},
    {name:'Code',type:'SERVER_JS',source:code},
    {name:'appsscript',type:'JSON',source:fs.readFileSync(path.join(__dirname,'appsscript.json'),'utf8')}
  ];
}
module.exports = {projectFiles};
if (require.main === module) {
  const output = process.argv[2];
  if (!output) {console.error('Cần đường dẫn tệp JSON bộ mã nguồn. Không có thao tác mạng trong lệnh này.');process.exitCode=1;}
  else {fs.writeFileSync(output,JSON.stringify({files:projectFiles()},null,2));console.log('Đã tạo bộ mã Apps Script; chưa cài hoặc bật lưu trữ trên Google Drive.');}
}
