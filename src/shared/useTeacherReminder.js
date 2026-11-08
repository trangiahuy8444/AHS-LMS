import { useEffect, useState } from 'react';

export function useTeacherReminder(target, active = true) {
  const [reminder, setReminder] = useState(null);
  const { grade, studentClass, studentId, sessionId, mode, uid } = target;
  useEffect(() => {
    setReminder(null);
    if (!active || !sessionId || !window.AsianSchoolCloud?.watchTeacherReminder) return;
    let listening = true;
    const unsubscribe = window.AsianSchoolCloud.watchTeacherReminder(
      { grade, studentClass, studentId, sessionId, mode, uid },
      value => { if (listening) setReminder(value); }
    );
    return () => { listening = false; unsubscribe?.(); };
  }, [active, grade, studentClass, studentId, sessionId, mode, uid]);
  return reminder;
}
