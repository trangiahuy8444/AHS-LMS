/** Private Apps Script: no doGet/doPost endpoint and no stored OAuth token. */
var AHS_ARCHIVE_SETTINGS = {projectId:'ahs-lms-sandbox',schoolYear:'2026-2027',period:'GK1'};
var AHS_ARCHIVE_CONFIG_KEY = 'AHS_ARCHIVE_CONFIG_V1';
var AHS_ARCHIVE_CURSOR_KEY = 'AHS_ARCHIVE_CURSOR_V1';
var AHS_ARCHIVE_BACKFILL_KEY = 'AHS_ARCHIVE_BACKFILL_V1';

function installDriveArchive() {
  if (['ahs-lms','ahs-lms-sandbox'].indexOf(AHS_ARCHIVE_SETTINGS.projectId) < 0) throw new Error('archive_project_invalid');
  var props = PropertiesService.getScriptProperties();
  var previous = JSON.parse(props.getProperty(AHS_ARCHIVE_CONFIG_KEY) || 'null');
  if (previous && previous.projectId !== AHS_ARCHIVE_SETTINGS.projectId) throw new Error('Không đổi dự án của kho đã cài. Tạo Apps Script riêng cho môi trường khác.');
  var requestedRoot = AHS_ARCHIVE_SETTINGS.rootFolderId;
  if (requestedRoot !== undefined && !/^[A-Za-z0-9_-]{10,}$/.test(requestedRoot)) throw new Error('archive_root_invalid');
  if (previous && requestedRoot && previous.rootFolderId !== requestedRoot) throw new Error('Không đổi thư mục của kho đã cài. Tạo bộ lưu trữ riêng nếu cần chuyển kho.');
  var rootFolder;
  if (previous) rootFolder = DriveApp.getFolderById(previous.rootFolderId);
  else if (requestedRoot) rootFolder=DriveApp.getFolderById(requestedRoot);
  else {
    if (['ahs-lms','ahs-lms-sandbox'].indexOf(AHS_ARCHIVE_SETTINGS.projectId) < 0) throw new Error('archive_project_invalid');
    rootFolder = DriveApp.createFolder('AHS-LMS-Archive_'+AHS_ARCHIVE_SETTINGS.projectId);
    rootFolder.setSharing(DriveApp.Access.PRIVATE,DriveApp.Permission.NONE);
  }
  ahsAssertPrivate(rootFolder);
  var config = {projectId:AHS_ARCHIVE_SETTINGS.projectId,schoolYear:AHS_ARCHIVE_SETTINGS.schoolYear,period:AHS_ARCHIVE_SETTINGS.period,rootFolderId:rootFolder.getId()};
  AHSArchiveEngine.validateConfig(config);
  props.setProperty(AHS_ARCHIVE_CONFIG_KEY,JSON.stringify(config));
  // Một bộ nhiều dự án dùng dispatcher chung để chỉ tạo một lịch.
  if (AHS_ARCHIVE_SETTINGS.manageTrigger !== false) {
    ScriptApp.getProjectTriggers().forEach(function(trigger) {
      if (trigger.getHandlerFunction() === 'runDriveArchive') ScriptApp.deleteTrigger(trigger);
    });
    ScriptApp.newTrigger('runDriveArchive').timeBased().everyMinutes(5).create();
  }
  if (!props.getProperty(AHS_ARCHIVE_BACKFILL_KEY)) props.setProperty(AHS_ARCHIVE_BACKFILL_KEY,JSON.stringify({collectionIndex:0,afterName:null,complete:false}));
  // Bật trạng thái tự động sau khi cấu hình, thư mục và lịch đã sẵn sàng; bảo vệ xóa là tùy chọn riêng.
  // Trạng thái thành công vẫn do lượt worker thực tế ghi, không giả định cài là đã lưu.
  if (AHS_ARCHIVE_SETTINGS.manageTrigger !== false) ahsEnableArchive(config,AHS_ARCHIVE_SETTINGS.activateDeletionProtection === true);
  if (AHS_ARCHIVE_SETTINGS.runInitial !== false) runDriveArchive();
}
function ahsEnableArchive(config,protectDeletes) {
  var name=ahsDocumentRoot(config)+'/exam_config/global_config';
  var response=ahsRequest(config,'get',name);
  if (response.status !== 200) throw new Error('archive_enable_config_unavailable');
  var existing=ahsDecodeFields(response.data.fields || {});
  var updates={};
  if (existing.driveArchiveEnabled !== true) updates.driveArchiveEnabled=true;
  if (protectDeletes === true && existing.driveArchiveProtectDeletes !== true) updates.driveArchiveProtectDeletes=true;
  if (!Object.keys(updates).length) return;
  var write={update:{name:name,fields:ahsFields(updates)},updateMask:{fieldPaths:Object.keys(updates)},currentDocument:{exists:true}};
  var saved=ahsRequest(config,'post',ahsDocumentRoot(config)+':commit',{writes:[write]});
  if (saved.status !== 200) throw new Error('archive_enable_failed');
}
function ahsArchiveConfig() {
  var config = JSON.parse(PropertiesService.getScriptProperties().getProperty(AHS_ARCHIVE_CONFIG_KEY) || 'null');
  AHSArchiveEngine.validateConfig(config);
  return config;
}
function ahsEncode(value) {
  if (value === null || value === undefined) return {nullValue:null};
  if (Array.isArray(value)) return {arrayValue:{values:value.map(ahsEncode)}};
  if (typeof value === 'object') return {mapValue:{fields:ahsFields(value)}};
  if (typeof value === 'boolean') return {booleanValue:value};
  if (typeof value === 'number') return Number.isInteger(value) ? {integerValue:String(value)} : {doubleValue:value};
  return {stringValue:String(value)};
}
function ahsFields(value) {
  var fields = {};
  Object.keys(value).forEach(function(key) {fields[key]=ahsEncode(value[key]);});
  return fields;
}
function ahsDecode(value) {
  if ('nullValue' in value) return null;
  if ('integerValue' in value) {
    var n = Number(value.integerValue);
    return Number.isSafeInteger(n) ? n : value.integerValue;
  }
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(ahsDecode);
  if ('mapValue' in value) return ahsDecodeFields(value.mapValue.fields || {});
  if ('stringValue' in value) return value.stringValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  return value;
}
function ahsDecodeFields(fields) {
  var output = {};
  Object.keys(fields || {}).forEach(function(key) {output[key]=ahsDecode(fields[key]);});
  return output;
}
function ahsDocument(document) {
  return {name:document.name,updateTime:document.updateTime,createTime:document.createTime,data:ahsDecodeFields(document.fields)};
}
function ahsDocumentRoot(config) {return 'projects/'+config.projectId+'/databases/(default)/documents';}
function ahsRequest(config,method,resource,body) {
  if (['ahs-lms','ahs-lms-sandbox'].indexOf(config.projectId) < 0 || resource.indexOf(ahsDocumentRoot(config)) !== 0) throw new Error('archive_target_invalid');
  var options = {method:method,muteHttpExceptions:true,headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()}};
  if (body !== undefined) {options.contentType='application/json';options.payload=JSON.stringify(body);}
  var response = UrlFetchApp.fetch('https://firestore.googleapis.com/v1/'+resource,options);
  var status = response.getResponseCode();
  if (status >= 200 && status < 300) return {status:status,data:JSON.parse(response.getContentText() || '{}')};
  // Không đưa response body vào lỗi: có thể chứa nội dung bài làm hoặc thông tin định danh.
  var errorCode='';
  try {errorCode=JSON.parse(response.getContentText()).error.status || '';} catch (ignored) {}
  return {status:status,data:null,errorCode:/^[A-Z_]+$/.test(errorCode) ? errorCode : ''};
}
function ahsPendingQuery(afterName,limit) {
  var query = {from:[{collectionId:'drive_archive_jobs'}],where:{fieldFilter:{field:{fieldPath:'pending'},op:'EQUAL',value:{booleanValue:true}}},orderBy:[{field:{fieldPath:'__name__'},direction:'ASCENDING'}],limit:limit};
  if (afterName) query.startAt={values:[{referenceValue:afterName}],before:false};
  return {structuredQuery:query};
}
function ahsQueryDocuments(config,body) {
  var response = ahsRequest(config,'post',ahsDocumentRoot(config)+':runQuery',body);
  if (response.status !== 200) throw new Error('archive_query_http_'+response.status);
  return response.data.filter(function(entry) {return !!entry.document;}).map(function(entry) {return ahsDocument(entry.document);});
}
function ahsAcknowledge(config,job,receipt) {
  var fields = {pending:false,archivedRevision:job.data.revision,driveFolderId:receipt.folderId || '',driveFileId:receipt.jsonFileId,spreadsheetId:receipt.spreadsheetId};
  var write = {update:{name:job.name,fields:ahsFields(fields)},updateMask:{fieldPaths:Object.keys(fields)},currentDocument:{updateTime:job.updateTime},updateTransforms:[{fieldPath:'archivedAt',setToServerValue:'REQUEST_TIME'}]};
  var response = ahsRequest(config,'post',ahsDocumentRoot(config)+':commit',{writes:[write]});
  if (response.status === 409 || response.status === 412 || response.errorCode === 'FAILED_PRECONDITION' || response.errorCode === 'ABORTED') return false;
  if (response.status !== 200) throw new Error('archive_ack_http_'+response.status);
  return true;
}
function ahsAssertPrivate(item) {
  if (item.getSharingAccess() !== DriveApp.Access.PRIVATE) throw new Error('archive_destination_not_private');
  return item;
}
function ahsFolder(parent,name) {
  var candidates = parent.getFoldersByName(name);
  return ahsAssertPrivate(candidates.hasNext() ? candidates.next() : parent.createFolder(name));
}
function ahsClassFolder(config,envelope) {
  var folder = ahsAssertPrivate(DriveApp.getFolderById(config.rootFolderId));
  envelope.folderSegments.forEach(function(segment) {folder=ahsFolder(folder,segment);});
  return folder;
}
function ahsClassSpreadsheet(folder) {
  var matches = folder.getFilesByName('Bang_Diem_Va_Nhat_Ky');
  while (matches.hasNext()) {
    var file = matches.next();
    if (file.getMimeType() === MimeType.GOOGLE_SHEETS) return SpreadsheetApp.openById(ahsAssertPrivate(file).getId());
  }
  var spreadsheet = SpreadsheetApp.create('Bang_Diem_Va_Nhat_Ky');
  DriveApp.getFileById(spreadsheet.getId()).moveTo(folder);
  return spreadsheet;
}
function ahsUpsertRow(sheet,row) {
  var lastRow = sheet.getLastRow();
  var index = lastRow > 1 ? sheet.getRange(2,1,lastRow-1,1).createTextFinder(String(row[0])).matchEntireCell(true).findNext() : null;
  var targetRow = index ? index.getRow() : Math.max(2,lastRow+1);
  sheet.getRange(targetRow,1,1,row.length).setValues([row]);
}
function ahsWriteArchive(config,envelope) {
  var folder = ahsClassFolder(config,envelope);
  var jsonFolder = ahsFolder(folder,envelope.source.collection === 'submissions' ? 'Bai_Lam' : 'Nhat_Ky_Va_Nguon');
  var fileName = envelope.source.collection+'__'+envelope.source.id+'.json';
  var matches = jsonFolder.getFilesByName(fileName);
  var content = JSON.stringify(envelope,null,2);
  var file = matches.hasNext() ? matches.next() : null;
  if (file) ahsAssertPrivate(file).setContent(content);
  else file=jsonFolder.createFile(fileName,content,MimeType.PLAIN_TEXT);
  var spreadsheet = ahsClassSpreadsheet(folder);
  var tabName = envelope.source.collection === 'submissions' ? 'Bai_Thi' : 'Nhat_Ky';
  var sheet = spreadsheet.getSheetByName(tabName) || spreadsheet.insertSheet(tabName);
  var headers = ['Khóa bản ghi','Mã LMS','Họ tên','Khối','Lớp','Mã đề','Lượt','Thời điểm nộp','Điểm khách quan','Điểm Đ/S','Điểm tự luận','Tổng điểm','Đã chấm','Đã xác nhận','Vi phạm','Số nhắc nhở','Bắt đầu','Phút ban đầu','Giây gia hạn','Giây làm bài','Giây trễ','Nhận xét','JSON đầy đủ','Phiên bản nguồn'];
  if (!sheet.getLastRow()) {sheet.getRange(1,1,1,headers.length).setValues([headers]);sheet.setFrozenRows(1);}
  ahsUpsertRow(sheet,AHSArchiveEngine.summaryRow(envelope,file.getUrl()));
  SpreadsheetApp.flush();
  return {folderId:folder.getId(),jsonFileId:file.getId(),spreadsheetId:spreadsheet.getId()};
}
function ahsArchiveAdapter(config) {
  var props = PropertiesService.getScriptProperties();
  return {
    listPending:function(limit) {
      var cursor = props.getProperty(AHS_ARCHIVE_CURSOR_KEY);
      var jobs = ahsQueryDocuments(config,ahsPendingQuery(cursor,limit));
      if (!jobs.length && cursor) {props.deleteProperty(AHS_ARCHIVE_CURSOR_KEY);jobs=ahsQueryDocuments(config,ahsPendingQuery(null,limit));}
      return jobs;
    },
    readSource:function(collection,id) {
      if (AHSArchiveEngine.SOURCES.indexOf(collection) < 0 || !/^[A-Za-z0-9_.:-]{1,250}$/.test(id)) throw new Error('archive_source_invalid');
      var response = ahsRequest(config,'get',ahsDocumentRoot(config)+'/'+collection+'/'+id);
      if (response.status !== 200) throw new Error('archive_source_http_'+response.status);
      return ahsDocument(response.data);
    },
    writeArchive:function(envelope) {return ahsWriteArchive(config,envelope);},
    acknowledge:function(job,receipt) {return ahsAcknowledge(config,job,receipt);},
    saveCursor:function(name) {props.setProperty(AHS_ARCHIVE_CURSOR_KEY,name);}
  };
}
function ahsWriteStatus(config,result,backfillComplete,errorCode) {
  var fields = {projectId:config.projectId,lastArchived:result.archived || 0,lastFailed:result.failed || 0,lastConflicts:result.conflicts || 0,backfillComplete:!!backfillComplete,lastErrorCode:errorCode || '',rootFolderId:config.rootFolderId};
  var write={update:{name:ahsDocumentRoot(config)+'/drive_archive_status/worker',fields:ahsFields(fields)},updateMask:{fieldPaths:Object.keys(fields)},updateTransforms:[{fieldPath:'lastRunAt',setToServerValue:'REQUEST_TIME'}]};
  if (!errorCode && !result.failed) write.updateTransforms.push({fieldPath:'lastSuccessAt',setToServerValue:'REQUEST_TIME'});
  var response = ahsRequest(config,'post',ahsDocumentRoot(config)+':commit',{writes:[write]});
  if (response.status !== 200) throw new Error('archive_status_http_'+response.status);
}
function runDriveArchive() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  var config, result={archived:0,failed:0,conflicts:0};
  try {
    config=ahsArchiveConfig();
    var started=Date.now();
    var budgetMs=Math.max(1000,Math.min(210000,Number(AHS_ARCHIVE_SETTINGS.runBudgetMs) || 210000));
    result=AHSArchiveEngine.runBatch(config,ahsArchiveAdapter(config),{budgetMs:budgetMs});
    var backfill=JSON.parse(PropertiesService.getScriptProperties().getProperty(AHS_ARCHIVE_BACKFILL_KEY) || '{"complete":true}');
    if (!backfill.complete && Date.now()-started < budgetMs) backfill=ahsBackfillPage(config);
    ahsWriteStatus(config,result,backfill.complete,'');
  } catch (error) {
    if (config) {
      try {ahsWriteStatus(config,result,false,'archive_worker_failed');} catch (ignored) {}
    }
    throw new Error('Không hoàn tất lưu trữ tự động. Kiểm tra quyền truy cập, hạn mức và trạng thái trong admin.');
  } finally {lock.releaseLock();}
}
function ahsBackfillRoute(source) {
  var data=source.data;
  var reminder=data.payload && data.payload.reminder;
  var grade=Number(data.grade !== undefined ? data.grade : (reminder && reminder.grade || 0));
  var studentClass=String(data.studentClass || (reminder && reminder.studentClass) || 'all');
  return {grade:grade,studentClass:studentClass};
}
function ahsBackfillPage(config) {
  var props=PropertiesService.getScriptProperties();
  var state=JSON.parse(props.getProperty(AHS_ARCHIVE_BACKFILL_KEY) || '{"collectionIndex":0,"afterName":null,"complete":false}');
  if (state.complete) return state;
  var collection=AHSArchiveEngine.SOURCES[state.collectionIndex];
  if (!collection) {state.complete=true;props.setProperty(AHS_ARCHIVE_BACKFILL_KEY,JSON.stringify(state));return state;}
  var query={from:[{collectionId:collection}],orderBy:[{field:{fieldPath:'__name__'},direction:'ASCENDING'}],limit:25};
  if (state.afterName) query.startAt={values:[{referenceValue:state.afterName}],before:false};
  var sources=ahsQueryDocuments(config,{structuredQuery:query});
  var writes=[];
  sources.forEach(function(source) {
    var id=source.name.split('/').pop();
    var jobName=ahsDocumentRoot(config)+'/drive_archive_jobs/'+collection+'_'+id;
    var existing=ahsRequest(config,'get',jobName);
    if (existing.status === 200) return;
    if (existing.status !== 404) throw new Error('archive_backfill_check_failed');
    var route=ahsBackfillRoute(source);
    writes.push({update:{name:jobName,fields:ahsFields({sourceCollection:collection,sourceId:id,grade:route.grade,studentClass:route.studentClass,revision:1,pending:true})},currentDocument:{exists:false},updateTransforms:[{fieldPath:'requestedAt',setToServerValue:'REQUEST_TIME'}]});
  });
  if (writes.length) {
    var response=ahsRequest(config,'post',ahsDocumentRoot(config)+':commit',{writes:writes});
    if (response.status === 409 || response.status === 412 || response.errorCode === 'FAILED_PRECONDITION' || response.errorCode === 'ABORTED') return state;
    if (response.status !== 200) throw new Error('archive_backfill_commit_failed');
  }
  if (sources.length < 25) {state.collectionIndex++;state.afterName=null;state.complete=state.collectionIndex>=AHSArchiveEngine.SOURCES.length;}
  else state.afterName=sources[sources.length-1].name;
  props.setProperty(AHS_ARCHIVE_BACKFILL_KEY,JSON.stringify(state));
  return state;
}
function backfillDriveArchive() {
  var lock=LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {return ahsBackfillPage(ahsArchiveConfig());}
  finally {lock.releaseLock();}
}
