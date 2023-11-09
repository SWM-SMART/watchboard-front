'use client';
import styles from './smallActionButton.module.css';
import 'material-symbols';
interface SmallActionButtonProps {
  label: string;
  icon: string;
  enabled?: boolean;
  border?: boolean;
  onClick?: () => void;
}

export default function SmallActionButton({
  label,
  icon,
  enabled = true,
  onClick,
  border = false,
}: SmallActionButtonProps) {
  return (
    <div
      className={`${styles.container} ${border ? styles.border : null} ${
        enabled ? null : styles.disabled
      }`}
      onClick={onClick}
    >
      <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
