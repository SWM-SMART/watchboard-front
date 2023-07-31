'use client';
import { MouseEventHandler } from 'react';
import styles from './actionButton.module.css';
import 'material-symbols';

interface ActionButtonProps {
  label: string;
  icon: string;
  onClick: MouseEventHandler;
}

export default function ActionButton({ label, icon, onClick }: ActionButtonProps) {
  return (
    <div className={styles.container} onClick={onClick}>
      <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
