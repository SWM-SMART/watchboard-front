'use client';
import { MouseEventHandler } from 'react';
import styles from './backgroundButton.module.css';
import 'material-symbols';

interface BackgroundButtonProps {
  text: string;
  icon?: string;
  invert?: boolean;
  onClick: MouseEventHandler;
}

export default function BackgroundButton({ text, icon, invert, onClick }: BackgroundButtonProps) {
  return (
    <div className={`${styles.container} ${invert ? styles.invert : null}`} onClick={onClick}>
      {icon === undefined ? null : (
        <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
      )}
      <span className={styles.text}>{text}</span>
    </div>
  );
}
