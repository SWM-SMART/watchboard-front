'use client';
import { ReactNode } from 'react';
import styles from './Dialogue.module.css';
import ClickableBackgroundButton from '../BackgroundButton/ClickableBackgroundButton';

interface DialogueProps {
  enabled: boolean;
  title: string;
  children?: ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function Dialogue({
  enabled = true,
  title,
  children,
  onCancel,
  onSubmit,
}: DialogueProps) {
  return (
    <div className={styles.container}>
      <p className={styles.title}>{title}</p>
      <div className={styles.itemContainer}>{children}</div>
      {enabled ? (
        <div className={styles.buttonContainer}>
          <ClickableBackgroundButton text={'취소'} onClick={onCancel} invert={false} />
          <ClickableBackgroundButton text={'확인'} onClick={onSubmit} invert={true} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
