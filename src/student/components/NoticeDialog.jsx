import React from 'react';
import { useStudent } from '../StudentContext.js';
import ConfirmDialog from '../../shared/components/ConfirmDialog.jsx';

// MODAL THÔNG BÁO TĨNH (KHÔNG NHẢY GIẬT, THAY THẾ ALERT)
export default function NoticeDialog() {
  const { customDialog, setCustomDialog } = useStudent();
  return <ConfirmDialog dialog={customDialog} onClose={() => setCustomDialog(null)} variant="student" />;
}
