'use client';
import { ChangeEventHandler } from 'react';
import styles from './TextInput.module.css';

interface TextInputProps {
  text?: string;
  label: string;
  multiline?: boolean;
  onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

export default function TextInput({ text, label, multiline = false, onChange }: TextInputProps) {
  const input = multiline ? (
    <textarea value={text} className={styles.input} rows={15} onChange={onChange} />
  ) : (
    <input value={text} className={styles.input} onChange={onChange} type="text" />
  );
  return (
    <div className={styles.container}>
      <p className={styles.label}>{label}</p>
      {input}
    </div>
  );
}
