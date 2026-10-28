import { createContext, useContext } from 'react';

// Toàn bộ state và hàm xử lý của Cổng Quản Trị (xem hooks/useAdminController.js)
export const AdminContext = createContext(null);

export function useAdmin() {
  return useContext(AdminContext);
}
