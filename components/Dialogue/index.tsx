'use client';
import { FormEvent, ReactNode, createContext } from 'react';
import styles from './Dialogue.module.css';
import ClickableBackgroundButton, {
  BackgroundSubmitButton,
} from '../BackgroundButton/ClickableBackgroundButton';

interface DialogueProps {
  enabled: boolean;
  title: string;
  children?: ReactNode;
  onCancel?: () => void;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
}

const FormContext = createContext({});

export default function Dialogue({
  enabled = true,
  title,
  children,
  onCancel,
  onSubmit,
}: DialogueProps) {
  return (
    <form className={styles.container} onSubmit={onSubmit}>
      <p className={styles.title}>{title}</p>
      <div className={styles.itemContainer}>{children}</div>
      {enabled ? (
        <div className={styles.buttonContainer}>
          <ClickableBackgroundButton text={'취소'} onClick={onCancel} invert={false} />
          <BackgroundSubmitButton text={'확인'} invert={true} />
        </div>
      ) : (
        <></>
      )}
    </form>
  );
}
