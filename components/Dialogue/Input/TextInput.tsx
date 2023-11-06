'use client';
import styles from './TextInput.module.css';

interface TextInputProps {
  text?: string;
  name: string;
  label: string;
  multiline?: boolean;
}

export default function TextInput({ text, label, multiline = false, name }: TextInputProps) {
  const input = multiline ? (
    <textarea value={text} className={styles.input} rows={15} />
  ) : (
    <input value={text} className={styles.input} type="text" name={name} />
  );
  return (
    <div className={styles.container}>
      <p className={styles.label}>{label}</p>
      {input}
    </div>
  );
}
