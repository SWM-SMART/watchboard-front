'use client';
import { ChangeEvent } from 'react';
import styles from './TextInput.module.css';

interface TextInputProps {
  label: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function TextInput({ label, onChange }: TextInputProps) {
  return (
    <div className={styles.container}>
      <p className={styles.label}>{label}</p>
      <input className={styles.input} onChange={onChange} type="text" />
    </div>
  );
}
