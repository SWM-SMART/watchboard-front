'use client';
import styles from './smallActionButton.module.css';
import 'material-symbols';
interface SmallActionButtonProps {
  label: string;
  icon: string;
  onClick?: () => void;
}

export default function SmallActionButton({ label, icon, onClick }: SmallActionButtonProps) {
  return (
    <div className={styles.container} onClick={onClick}>
      <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
