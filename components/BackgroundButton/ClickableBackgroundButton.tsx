'use client';
import styles from './backgroundButton.module.css';
import 'material-symbols';
import { MouseEventHandler } from 'react';

interface ClickableBackgroundButtonProps {
  text: string;
  color?: ColorScheme;
  thin?: boolean;
  icon?: string;
  invert?: boolean;
  onClick?: MouseEventHandler;
}

type ColorScheme = 'primary' | 'secondary' | 'grey';

export default function ClickableBackgroundButton({
  text,
  color = 'primary',
  thin = false,
  icon,
  invert,
  onClick,
}: ClickableBackgroundButtonProps) {
  return (
    <div
      onClick={onClick}
      className={`${styles.container} ${invert ? styles.invert : null} ${getClassFromColor(
        color,
      )} ${thin ? styles.thin : null}`}
    >
      {icon === undefined ? null : (
        <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
      )}
      <span className={styles.text}>{text}</span>
    </div>
  );
}

function getClassFromColor(color: ColorScheme) {
  switch (color) {
    case 'primary':
      return '';
    case 'secondary':
      return styles.secondary;
    case 'grey':
      return styles.grey;
  }
}

interface BackgroundSubmitButtonProps {
  text: string;
  color?: ColorScheme;
  invert?: boolean;
}

export function BackgroundSubmitButton({
  text,
  invert,
  color = 'primary',
}: BackgroundSubmitButtonProps) {
  return (
    <input
      type="submit"
      className={`${styles.submit} ${invert ? styles.invert : null} ${getClassFromColor(color)}`}
      value={text}
    />
  );
}
