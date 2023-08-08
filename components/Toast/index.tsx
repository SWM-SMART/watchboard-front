import styles from './Toast.module.css';

interface ToastProps {
  id: number;
  msg: string;
  duration: number;
}

export default function Toast({ id, msg, duration }: ToastProps) {
  return (
    <div className={styles.container}>
      <p className={styles.text}>{msg}</p>
      <div
        className={styles.progressBar}
        style={{ animation: `progress-bar ${duration}ms linear` }}
      />
    </div>
  );
}
