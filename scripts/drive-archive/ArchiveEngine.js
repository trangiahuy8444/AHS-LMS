/* Dùng trực tiếp trong Apps Script V8; phần export bên dưới phục vụ kiểm thử Node. */
var AHSArchiveEngine = (function () {
  var SOURCES = ['submissions', 'exam_attempts', 'proctor_commands', 'exam_bank', 'practice_results'];
  var PROJECTS = {'ahs-lms':'Chinh_Thuc','ahs-lms-sandbox':'Thu_Nghiem'};
  function validateConfig(config) {
    if (!config || !PROJECTS[config.projectId] || !/^[A-Za-z0-9_-]{10,}$/.test(config.rootFolderId || '')
      || !/^\d{4}-\d{4}$/.test(config.schoolYear || '') || !/^[A-Za-z0-9_-]{1,30}$/.test(config.period || '')) throw new Error('archive_config_invalid');
  }
  function validateJob(config,job) {
    validateConfig(config);
    var data = job && job.data;
    if (!data || SOURCES.indexOf(data.sourceCollection) < 0 || !/^[A-Za-z0-9_.:-]{1,250}$/.test(data.sourceId || '')
      || !Number.isInteger(data.revision) || data.revision < 1 || !job.updateTime
      || !(job.name || '').startsWith('projects/' + config.projectId + '/databases/(default)/documents/drive_archive_jobs/')) throw new Error('archive_job_invalid');
  }
  function scrub(value) {
    if (Array.isArray(value)) return value.map(scrub);
    if (!value || typeof value !== 'object') return value;
    var output = {};
    Object.keys(value).forEach(function(key) {
      if (/password|token|apikey|webhook|authorization|credential|privatekey/i.test(key)) return;
      output[key] = scrub(value[key]);
    });
    return output;
  }
  function buildEnvelope(config,job,source,archivedAt) {
    validateJob(config,job);
    if (!source || !source.data || !source.updateTime) throw new Error('archive_source_missing');
    var data = source.data;
    var reminder = data.payload && data.payload.reminder;
    var grade = Number(data.grade !== undefined ? data.grade : (reminder && reminder.grade !== undefined ? reminder.grade : job.data.grade));
    var studentClass = String(data.studentClass || (reminder && reminder.studentClass) || job.data.studentClass || '').trim();
    var classSegment;
    if (job.data.sourceCollection === 'exam_bank') {
      if ([8,9,10].indexOf(grade) < 0) throw new Error('archive_grade_invalid');
      classSegment = '_DE_CHUNG';
    } else if (grade === 0 && studentClass === 'all' && job.data.sourceCollection === 'proctor_commands') {
      classSegment = '_TOAN_TRUONG';
    } else {
      if ([8,9,10].indexOf(grade) < 0 || !new RegExp('^'+grade+'/[0-9]{1,3}$').test(studentClass)) throw new Error('archive_class_invalid');
      if (job.data.studentClass && job.data.studentClass !== studentClass) throw new Error('archive_class_mismatch');
      classSegment = 'Lop_' + studentClass.replace('/', '_');
    }
    return {
      schemaVersion:1, projectId:config.projectId, environment:PROJECTS[config.projectId],
      schoolYear:config.schoolYear,period:config.period,
      source:{collection:job.data.sourceCollection,id:job.data.sourceId,updateTime:source.updateTime,createTime:source.createTime || null},
      jobRevision:job.data.revision,archivedAt:archivedAt || new Date().toISOString(),
      folderSegments:[PROJECTS[config.projectId],config.schoolYear,config.period,grade ? 'Khoi_'+grade : 'Khoi_Chung',classSegment],
      data:scrub(data)
    };
  }
  function safeCell(value) {
    if (value === undefined || value === null) return '';
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    var text = String(value);
    if (text.length > 48950) text=text.slice(0,48950)+'… [Xem JSON đầy đủ]';
    return /^\s*[=+\-@]/.test(text) ? "'" + text : text;
  }
  function summaryRow(envelope,jsonUrl) {
    var d = envelope.data;
    var reminder = d.teacherReminder || {};
    return [envelope.source.collection+'/'+envelope.source.id,d.studentId,d.fullName,d.grade,d.studentClass,d.examCode,
      d.attemptNumber || d.attemptsUsed || 1,d.submittedAt || d.serverSubmittedAt || '',d.mcqPoints,d.tfPoints,d.essayTotal,d.finalScore,
      d.isGraded === true,d.scoreConfirmed === true,d.violations || 0,reminder.count || 0,d.startedAt,d.durationMinutes,
      d.extraTimeSeconds || 0,d.durationSeconds,d.overtimeSeconds,d.teacherFeedback || '',jsonUrl,envelope.source.updateTime].map(safeCell);
  }
  function runBatch(config,adapter,options) {
    validateConfig(config);
    var opts = options || {}, now = opts.now || Date.now, started = now();
    var budgetMs = opts.budgetMs || 240000;
    var result = {archived:0,failed:0,conflicts:0,budgetReached:false};
    var jobs = adapter.listPending(25);
    for (var i=0;i<jobs.length;i++) {
      if (now()-started >= budgetMs) {result.budgetReached=true;break;}
      var job = jobs[i];
      try {
        validateJob(config,job);
        var source = adapter.readSource(job.data.sourceCollection,job.data.sourceId);
        var envelope = buildEnvelope(config,job,source,new Date(now()).toISOString());
        var receipt = adapter.writeArchive(envelope);
        if (!receipt || !receipt.jsonFileId || !receipt.spreadsheetId) throw new Error('archive_receipt_invalid');
        if (adapter.acknowledge(job,receipt)) result.archived++;
        else result.conflicts++;
      } catch (error) {
        result.failed++;
      }
      // Lưu vòng quét cả khi lỗi để một tài liệu lỗi không chặn các lớp khác.
      adapter.saveCursor(job.name);
    }
    return result;
  }
  return {SOURCES:SOURCES,validateConfig:validateConfig,validateJob:validateJob,scrub:scrub,buildEnvelope:buildEnvelope,safeCell:safeCell,summaryRow:summaryRow,runBatch:runBatch};
}());
if (typeof module === 'object' && module.exports) module.exports = AHSArchiveEngine;
