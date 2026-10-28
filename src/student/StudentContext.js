import { createContext, useContext } from 'react';

// Toàn bộ state và hàm xử lý của cổng học sinh (xem hooks/useStudentController.js)
export const StudentContext = createContext(null);

export function useStudent() {
  return useContext(StudentContext);
}
