import { useEffect } from 'react';

// Chặn phím tắt mở Inspector / DevTools trên Windows và macOS khi đang làm bài
export function useBlockDevtools() {

  // Chặn toàn diện phím tắt mở Inspector / DevTools trên cả Windows và macOS (F12, Cmd+Opt+I/J/C, Ctrl+Shift+I/J/C)
  useEffect(() => {
    const handleInspectBlock = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      if (isCtrlOrCmd && (e.shiftKey || e.altKey) && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
      if (isCtrlOrCmd && ['u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
    };
    const handleContextMenuBlock = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', handleInspectBlock, true);
    document.addEventListener('contextmenu', handleContextMenuBlock, true);
    return () => {
      window.removeEventListener('keydown', handleInspectBlock, true);
      document.removeEventListener('contextmenu', handleContextMenuBlock, true);
    };
  }, []);
}
