'use client';
import { ChangeEventHandler } from 'react';
import styles from './TextInput.module.css';

interface TextInputProps {
  label: string;
  multiline?: boolean;
  onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

export default function TextInput({ label, multiline = false, onChange }: TextInputProps) {
  const input = multiline ? (
    <textarea className={styles.input} rows={15} onChange={onChange} />
  ) : (
    <input className={styles.input} onChange={onChange} type="text" />
  );
  return (
    <div className={styles.container}>
      <p className={styles.label}>{label}</p>
      {input}
    </div>
  );
}
