// Chụp ảnh kết quả để học sinh nộp lên LMS
// s: state và hàm của cổng học sinh (xem hooks/useStudentController.js)
export function createCaptureActions(s) {
  const { grade, mode, fullName, studentClass, studentId, sessionId, scoreResult, setIsCapturing,
    showDialog } = s;

  // CHỤP ẢNH MÀN HÌNH KẾT QUẢ ĐỂ HỌC SINH NỘP LÊN LMS
  const handleCaptureScreenshot = async () => {
    const card = document.getElementById('result-capture-card');
    if (!card) return;
    setIsCapturing(true);

    const cleanLms = (studentId || 'ChuaCoLMS').trim().replace(/[^a-zA-Z0-9]/g, '');
    const cleanName = (fullName || 'HocSinh').trim().replace(/\s+/g, '_');
    const cleanClass = (studentClass || 'Lop').replace(/[\/\s]/g, '_');
    const modeTag = mode === 'exam' ? 'ThiGK1' : 'OnTap';
    const attemptTag = mode === 'practice' ? `_Lan${scoreResult?.attemptNumber || 1}` : '';
    const fileName = `LMS_${cleanLms}_${cleanName}_Lop_${cleanClass}_Tin${grade}_${modeTag}${attemptTag}.png`;

    try {
      let dataUrl = null;

      if (typeof html2canvas !== 'undefined') {
        try {
          const canvas = await html2canvas(card, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scrollY: -window.scrollY,
            scrollX: 0
          });
          dataUrl = canvas.toDataURL('image/png');
        } catch (canvasErr) {
          console.warn('html2canvas toDataURL fallback to Canvas 2D engine', canvasErr);
        }
      }

      if (!dataUrl) {
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 1200;
        fallbackCanvas.height = 760;
        const ctx = fallbackCanvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1200, 760);

        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 1160, 720);
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 2;
        ctx.strokeRect(32, 32, 1136, 696);

        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText('TRƯỜNG TIỂU HỌC, THCS & THPT QUỐC TẾ Á CHÂU', 60, 85);
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`BỘ MÔN TIN HỌC — XÁC NHẬN KẾT QUẢ BÀI LÀM (${mode === 'practice' ? 'ÔN TẬP ĐỀ CƯƠNG' : 'THI GIỮA HỌC KỲ 1'})`, 60, 125);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, 155);
        ctx.lineTo(1140, 155);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`Họ và tên học sinh: ${fullName || 'Học sinh'}`, 60, 215);
        ctx.fillText(`Lớp học: Lớp ${studentClass}`, 60, 265);
        ctx.fillStyle = '#1d4ed8';
        ctx.fillText(`Mã LMS: ${studentId || 'Chưa nhập'}`, 60, 315);
        ctx.fillStyle = '#0f172a';
        ctx.fillText(`Khối lớp: Khối ${grade}`, 60, 365);
        if (mode === 'practice') {
          ctx.fillStyle = '#b45309';
          ctx.fillText(`Số lần rèn luyện: LẦN THỨ ${scoreResult?.attemptNumber || 1}`, 60, 415);
          ctx.fillStyle = '#475569';
          ctx.fillText(`Mã đề: ${scoreResult?.examCode || 'Đề cương ôn tập'}`, 60, 455);
        } else {
          ctx.fillText(`Mã đề: ${scoreResult?.examCode || 'Đề thi chính thức'}`, 60, 415);
        }

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(720, 185, 420, 290);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(720, 185, 420, 290);

        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(mode === 'practice' ? 'ĐIỂM ĐẠT ĐƯỢC' : 'BÀI THI CHÍNH THỨC', 930, 230);

        ctx.font = 'black 84px sans-serif';
        ctx.fillStyle = '#dc2626';
        if (mode === 'practice') {
          ctx.fillText(`${scoreResult?.score ?? 0} / 10`, 930, 335);
        } else {
          ctx.font = 'bold 54px sans-serif';
          ctx.fillStyle = '#047857';
          ctx.fillText('ĐÃ NỘP BÀI', 930, 335);
        }

        if (mode === 'practice') {
          ctx.font = 'bold 18px sans-serif';
          ctx.fillStyle = '#059669';
          ctx.fillText(`Đúng: ${scoreResult?.correctCount || 0}/${scoreResult?.totalQuestions || 0} câu trắc nghiệm`, 930, 380);

          // Khung làm nổi bật và chống che mất SỐ LẦN ĐÃ LÀM
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(740, 405, 380, 50);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(740, 405, 380, 50);

          ctx.fillStyle = '#92400e';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(`[ SỐ LẦN ĐÃ LÀM: LẦN THỨ ${scoreResult?.attemptNumber || 1} ]`, 930, 438);
        }
        ctx.textAlign = 'left';

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, 505);
        ctx.lineTo(1140, 505);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = '16px sans-serif';
        ctx.fillText(`Thời gian nộp bài: ${new Date(scoreResult?.submittedAt || Date.now()).toLocaleString('vi-VN')}`, 60, 540);
        ctx.fillText(`Thời gian làm bài thực tế: ${scoreResult?.durationFormatted || '45 phút'}`, 60, 570);
        const violText = `Số lần vi phạm an toàn bài thi: ${scoreResult?.violations || 0} lần ${scoreResult?.violations >= 3 ? '— [BIÊN BẢN: TRỪ 5 ĐIỂM]' : ''}`;
        if (scoreResult?.violations >= 3) {
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(violText, 60, 600);
        } else {
          ctx.fillText(violText, 60, 600);
        }
        ctx.fillStyle = '#475569';
        ctx.font = '16px sans-serif';
        ctx.fillText(`Mã phiên làm bài (Session): ${scoreResult?.sessionId || sessionId || 'N/A'}`, 60, 630);

        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('ĐÃ ĐƯỢC HỆ THỐNG XÁC THỰC — DÙNG ẢNH NÀY NỘP LÊN LMS', 60, 640);

        dataUrl = fallbackCanvas.toDataURL('image/png');
      }

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      showDialog(
        '📸 ĐÃ LƯU ẢNH KẾT QUẢ VỀ MÁY THÀNH CÔNG',
        `Tên tệp: ${fileName}\n\nEm hãy dùng tệp ảnh vừa tải về để nộp lên hệ thống LMS nhé!`,
        'success'
      );
    } catch (err) {
      console.error('Lỗi khi chụp màn hình', err);
      showDialog(
        'Không Thể Tạo Ảnh Tự Động',
        'Em có thể dùng chức năng chụp màn hình (PrintScreen / Snipping Tool) của máy tính để lưu lại và nộp lên LMS nhé!',
        'warning'
      );
    } finally {
      setIsCapturing(false);
    }
  };

  return { handleCaptureScreenshot };
}
