import React, { useState, useEffect, useRef } from 'react';
import { useStudent } from '../StudentContext.js';
import { safeEvaluateExpression } from '../actions/calculator.js';

export { safeEvaluateExpression };

/**
 * Định dạng số có dấu phẩy ngăn cách hàng nghìn cho dễ đọc
 */
function formatNumberWithCommas(val) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  const parts = String(val).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export default function CalculatorWidget() {
  const { isCalculatorOpen, setIsCalculatorOpen, mode, practiceAnswers, setPracticeAnswers,
    examAnswers, setExamAnswers, activeQuestionIdx, practiceItems, examItems, grade } = useStudent();

  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const calcContainerRef = useRef(null);

  // Tính toán kết quả
  const handleCalculate = () => {
    if (!expression.trim()) return;
    try {
      const res = safeEvaluateExpression(expression);
      // Giới hạn chữ số thập phân tối đa 6 chữ số
      const rounded = Number.isInteger(res) ? res : Math.round(res * 1000000) / 1000000;
      setResult(String(rounded));
      setIsCalculated(true);
    } catch (err) {
      setResult(err.message || 'Lỗi');
      setIsCalculated(true);
    }
  };

  // Thêm ký tự vào biểu thức
  const handleAppend = (val) => {
    if (isCalculated) {
      // Nếu vừa bấm bằng và người dùng bấm toán tử, tiếp tục tính từ kết quả
      if ('+-×÷*/^%'.includes(val) && result && !isNaN(Number(result))) {
        setExpression(result + ' ' + val + ' ');
        setResult('');
        setIsCalculated(false);
        return;
      }
      // Nếu bấm số mới, bắt đầu biểu thức mới
      setExpression(val);
      setResult('');
      setIsCalculated(false);
      return;
    }

    if ('+-×÷*/'.includes(val)) {
      setExpression(prev => (prev ? prev + ' ' + val + ' ' : val + ' '));
    } else {
      setExpression(prev => prev + val);
    }
  };

  // Xóa toàn bộ
  const handleClear = () => {
    setExpression('');
    setResult('');
    setIsCalculated(false);
  };

  // Xóa 1 ký tự cuối
  const handleBackspace = () => {
    if (isCalculated) {
      handleClear();
      return;
    }
    setExpression(prev => {
      const trimmed = prev.trimEnd();
      if (trimmed.length <= 1) return '';
      // Nếu ký tự cuối là khoảng trắng, xóa cả khoảng trắng và toán tử
      if (prev.endsWith(' ')) {
        return prev.slice(0, -3);
      }
      return prev.slice(0, -1);
    });
  };

  // Chèn kết quả vào bài làm tự luận hiện tại
  const handleInsertIntoAnswer = () => {
    const valToInsert = result || expression;
    if (!valToInsert || isNaN(Number(valToInsert))) return;

    const activeList = mode === 'practice' ? practiceItems : examItems;
    const currentItem = activeList[activeQuestionIdx] || activeList[0];
    if (!currentItem || !(currentItem.type === 'essay' || currentItem.type === 'exam_essay')) {
      // Nếu không ở câu tự luận, chỉ copy vào clipboard
      handleCopyResult();
      return;
    }

    const qNum = currentItem.data.num;
    if (mode === 'practice') {
      setPracticeAnswers(prev => {
        const currentEssay = prev.essay[qNum] || '';
        const separator = currentEssay && !currentEssay.endsWith(' ') && !currentEssay.endsWith('\n') ? ' ' : '';
        return {
          ...prev,
          essay: { ...prev.essay, [qNum]: currentEssay + separator + valToInsert }
        };
      });
    } else {
      setExamAnswers(prev => {
        const currentEssay = prev.essay[qNum] || '';
        const separator = currentEssay && !currentEssay.endsWith(' ') && !currentEssay.endsWith('\n') ? ' ' : '';
        return {
          ...prev,
          essay: { ...prev.essay, [qNum]: currentEssay + separator + valToInsert }
        };
      });
    }

    setCopiedNotification('Đã chèn vào bài làm!');
    setTimeout(() => setCopiedNotification(''), 2000);
  };

  // Sao chép kết quả
  const handleCopyResult = () => {
    const text = result || expression;
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedNotification('Đã sao chép!');
      setTimeout(() => setCopiedNotification(''), 2000);
    }
  };

  // Lắng nghe phím Enter / Escape khi đang mở máy tính
  useEffect(() => {
    if (!isCalculatorOpen || isMinimized) return;

    const handleKeyDown = (e) => {
      // Nếu đang gõ trong textarea hoặc input thì không can thiệp
      if (['TEXTAREA', 'INPUT', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsCalculatorOpen(false);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if ('0123456789.()'.includes(e.key)) {
        handleAppend(e.key);
      } else if (e.key === '+') {
        handleAppend('+');
      } else if (e.key === '-') {
        handleAppend('-');
      } else if (e.key === '*' || e.key === 'x') {
        handleAppend('×');
      } else if (e.key === '/') {
        handleAppend('÷');
      } else if (e.key === '^') {
        handleAppend('^');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCalculatorOpen, isMinimized, expression, result, isCalculated]);

  if (!isCalculatorOpen) return null;

  // Trạng thái thu nhỏ: chỉ hiện thanh công cụ nhỏ góc dưới
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="px-4 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xl flex items-center space-x-2 border-2 border-white animate-bounce"
        >
          <span className="text-base">🧮</span>
          <span>Máy tính cầm tay {result ? `(${result})` : ''}</span>
          <span className="text-[10px] bg-blue-900 px-1.5 py-0.5 rounded font-black">Mở rộng ⤢</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={calcContainerRef}
      className="fixed bottom-4 right-4 z-40 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border-2 border-blue-500 overflow-hidden font-sans flex flex-col transition-all duration-200"
      style={{ maxHeight: '90vh' }}
    >
      {/* HEADER MÁY TÍNH */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-3 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🧮</span>
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider">MÁY TÍNH CẦM TAY</h3>
            <span className="text-[10px] text-blue-200 font-semibold">Bộ môn Tin học — Hỗ trợ Khối 10</span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            title="Thu nhỏ xuống góc"
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black text-xs flex items-center justify-center transition"
          >
            —
          </button>
          <button
            type="button"
            onClick={() => setIsCalculatorOpen(false)}
            title="Đóng máy tính"
            className="w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-600 text-white font-black text-xs flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* MÀN HÌNH HIỂN THỊ (DISPLAY) */}
      <div className="p-3.5 bg-slate-900 text-right select-all space-y-1">
        <div className="text-xs text-slate-400 font-mono-code min-h-[18px] break-all leading-relaxed">
          {expression || '0'}
        </div>
        <div className="text-2xl font-black text-emerald-400 font-mono-code tracking-wide break-all">
          {result ? formatNumberWithCommas(result) : (expression ? '= ?' : '0')}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
          <span>Đơn vị: <strong>Byte · KB · MB · GB</strong></span>
          {copiedNotification ? (
            <span className="text-emerald-300 font-bold animate-pulse">✓ {copiedNotification}</span>
          ) : (
            <span className="text-slate-500">Phím tắt: 0-9, +, -, *, /, Enter</span>
          )}
        </div>
      </div>

      {/* THANH PHÍM TẮT ĐẶC TRƯNG TIN HỌC (QUICK CONVERSIONS) */}
      <div className="px-3 pt-2 pb-1 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-1 text-[11px] font-bold">
        <button
          type="button"
          onClick={() => handleAppend('× 1024')}
          title="Nhân 1024 (Đổi sang đơn vị nhỏ hơn: MB -> KB -> Byte)"
          className="flex-1 py-1.5 px-1 rounded-lg bg-white hover:bg-blue-50 text-blue-900 border border-slate-300 shadow-xs text-center transition"
        >
          × 1024
        </button>
        <button
          type="button"
          onClick={() => handleAppend('÷ 1024')}
          title="Chia 1024 (Đổi sang đơn vị lớn hơn: Byte -> KB -> MB)"
          className="flex-1 py-1.5 px-1 rounded-lg bg-white hover:bg-blue-50 text-blue-900 border border-slate-300 shadow-xs text-center transition"
        >
          ÷ 1024
        </button>
        <button
          type="button"
          onClick={() => handleAppend('× 8')}
          title="Nhân 8 (Đổi Byte sang Bit)"
          className="flex-1 py-1.5 px-1 rounded-lg bg-white hover:bg-blue-50 text-indigo-900 border border-slate-300 shadow-xs text-center transition"
        >
          × 8
        </button>
        <button
          type="button"
          onClick={() => handleAppend('÷ 8')}
          title="Chia 8 (Đổi Bit sang Byte)"
          className="flex-1 py-1.5 px-1 rounded-lg bg-white hover:bg-blue-50 text-indigo-900 border border-slate-300 shadow-xs text-center transition"
        >
          ÷ 8
        </button>
        <button
          type="button"
          onClick={() => handleAppend('2^')}
          title="Lũy thừa 2 (2^10 = 1024, 2^20 = 1048576...)"
          className="flex-1 py-1.5 px-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 shadow-xs text-center transition"
        >
          2ⁿ
        </button>
      </div>

      {/* BÀN PHÍM SỐ & PHÉP TOÁN (KEYPAD GRID) */}
      <div className="p-3 bg-slate-50 grid grid-cols-5 gap-1.5">
        {/* HÀNG 1 */}
        <button
          type="button"
          onClick={handleClear}
          className="py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 font-black text-xs transition border border-red-200"
        >
          AC
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs transition"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={() => handleAppend('(')}
          className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
        >
          (
        </button>
        <button
          type="button"
          onClick={() => handleAppend(')')}
          className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
        >
          )
        </button>
        <button
          type="button"
          onClick={() => handleAppend('÷')}
          className="py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-black text-sm transition border border-blue-200"
        >
          ÷
        </button>

        {/* HÀNG 2 */}
        <button
          type="button"
          onClick={() => handleAppend('7')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleAppend('8')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleAppend('9')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleAppend('×')}
          className="py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-black text-sm transition border border-blue-200"
        >
          ×
        </button>
        <button
          type="button"
          onClick={() => handleAppend('^')}
          className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
          title="Lũy thừa (x^y)"
        >
          xʸ
        </button>

        {/* HÀNG 3 */}
        <button
          type="button"
          onClick={() => handleAppend('4')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleAppend('5')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleAppend('6')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleAppend('-')}
          className="py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-black text-sm transition border border-blue-200"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => handleAppend('^2')}
          className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
          title="Bình phương"
        >
          x²
        </button>

        {/* HÀNG 4 */}
        <button
          type="button"
          onClick={() => handleAppend('1')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleAppend('2')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleAppend('3')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleAppend('+')}
          className="py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-black text-sm transition border border-blue-200"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => handleAppend('%')}
          className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
          title="Phần trăm hoặc chia lấy dư"
        >
          %
        </button>

        {/* HÀNG 5 */}
        <button
          type="button"
          onClick={() => handleAppend('0')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => handleAppend('00')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xs border border-slate-200 transition"
        >
          00
        </button>
        <button
          type="button"
          onClick={() => handleAppend('.')}
          className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xs border border-slate-200 transition"
        >
          .
        </button>
        <button
          type="button"
          onClick={handleCalculate}
          className="col-span-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-base shadow transition flex items-center justify-center space-x-1"
        >
          <span>=</span>
          <span className="text-xs uppercase font-extrabold ml-1">Tính</span>
        </button>
      </div>

      {/* FOOTER HÀNH ĐỘNG: CHÈN VÀO BÀI LÀM HOẶC SAO CHÉP */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
        <button
          type="button"
          onClick={handleInsertIntoAnswer}
          disabled={!result && !expression}
          className="flex-1 py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs transition shadow-sm flex items-center justify-center space-x-1"
        >
          <span>📋</span>
          <span>Chèn kết quả vào bài</span>
        </button>
        <button
          type="button"
          onClick={handleCopyResult}
          disabled={!result && !expression}
          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-bold text-xs transition border border-slate-300"
          title="Sao chép kết quả"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
