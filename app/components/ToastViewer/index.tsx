'use client';
import styles from './ToastViewer.module.css';
import { useToast } from '@/states/toast';
import { useEffect, useState } from 'react';
import Toast from '@/components/Toast';

export default function ToastViewer() {
  const [toast, setToast] = useState<ToastData | null>(null);

  const { toasts, popToast } = useToast((state) => ({
    popToast: state.popToast,
    toasts: state.toasts,
  }));

  // if new toasts are in, pop
  useEffect(() => {
    if (toast !== null) return;
    const newToast = popToast();
    if (newToast === null) return;
    setToast(newToast);
  }, [popToast, toast, toasts]);

  // if new toast is loaded, set Timeout!
  useEffect(() => {
    if (toast === null) return;
    const timeOut = setTimeout(() => setToast(popToast()), toast.duraton);
    return () => clearTimeout(timeOut);
  }, [popToast, toast]);

  if (toast === null) return null;

  return (
    <div className={styles.container} onClick={() => setToast(popToast())}>
      {toasts.length > 0 ? <p className={styles.count}>{toasts.length}</p> : <></>}
      <Toast key={`toast-${toast.id}`} id={toast.id} msg={toast.msg} duration={toast.duraton} />
    </div>
  );
}
