import React from 'react';
import { useAdmin } from '../AdminContext.js';
import ConfirmDialog from '../../shared/components/ConfirmDialog.jsx';

// DIALOG XÁC NHẬN / THÔNG BÁO TĨNH (GIỮA MÀN HÌNH, KHÔNG GIẬT NẢY)
export default function AdminDialog() {
  const { adminDialog, setAdminDialog } = useAdmin();
  return <ConfirmDialog dialog={adminDialog} onClose={() => setAdminDialog(null)} variant="admin" />;
}
