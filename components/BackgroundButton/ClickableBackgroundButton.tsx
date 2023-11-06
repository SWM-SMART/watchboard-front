'use client';
import styles from './backgroundButton.module.css';
import 'material-symbols';
import { MouseEventHandler } from 'react';

interface ClickableBackgroundButtonProps {
  text: string;
  icon?: string;
  invert?: boolean;
  onClick?: MouseEventHandler;
}

export default function ClickableBackgroundButton({
  text,
  icon,
  invert,
  onClick,
}: ClickableBackgroundButtonProps) {
  return (
    <div onClick={onClick} className={`${styles.container} ${invert ? styles.invert : null}`}>
      {icon === undefined ? null : (
        <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
      )}
      <span className={styles.text}>{text}</span>
    </div>
  );
}

interface BackgroundSubmitButtonProps {
  text: string;
  invert?: boolean;
}

export function BackgroundSubmitButton({ text, invert }: BackgroundSubmitButtonProps) {
  return (
    <input
      type="submit"
      className={`${styles.submit} ${invert ? styles.invert : null}`}
      value={text}
    />
  );
}
