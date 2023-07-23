'use client';
import { MouseEventHandler } from 'react';
import styles from './button.module.css';
import 'material-symbols';

interface ButtonProps {
  text: string;
  icon?: string;
  invert?: boolean;
  onClick: MouseEventHandler;
}

export default function Button({ text, icon, invert, onClick }: ButtonProps) {
  return (
    <div className={`${styles.container} ${invert ? styles.invert : null}`} onClick={onClick}>
      {icon === undefined ? null : (
        <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
      )}
      <span className={styles.text}>{text}</span>
    </div>
  );
}
