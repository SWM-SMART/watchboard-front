import { useCallback, useRef, useState } from 'react';
import styles from './fileInput.module.css';
interface FileInputProps {
  name: string;
  types: string[];
  typeNames: string[];
  onError?: (msg: string) => void;
}

export default function FileInput({ name, types, onError, typeNames }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>();
  const validateFile = useCallback(() => {
    if (inputRef.current === null) return;
    // validate file here
    if (inputRef.current.files === null || inputRef.current.files.length === 0)
      return setFileName(undefined);
    const file = inputRef.current.files[0];
    // check types
    if (!checkType(types, file.type)) {
      inputRef.current.value = '';
      setFileName(undefined);
      if (onError === undefined) return;
      return onError(`지원하지 않는 파일 형식입니다!`);
    }
    setFileName(file.name);
  }, [onError, types]);

  return (
    <div className={styles.container}>
      <p className={styles.label}>학습 자료</p>
      <div
        className={styles.fileContainer}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (inputRef.current === null || e.dataTransfer.files.length === 0) return;
          const file = e.dataTransfer.files[0];
          const dt = new DataTransfer();
          dt.items.add(file);
          inputRef.current.files = dt.files;
          validateFile();
        }}
        onClick={() => inputRef.current?.click()}
      >
        {fileName === undefined ? (
          <>
            <p className={styles.text}>드래그 & 드롭 혹은 클릭하여 파일 업로드</p>
            <p className={styles.text}>{`지원 형식: ${typeNames}`}</p>
          </>
        ) : (
          <p className={styles.text}>{fileName}</p>
        )}
        <input
          accept={types.toString()}
          id="file"
          ref={inputRef}
          className={styles.fileInput}
          type="file"
          name={name}
          onChange={validateFile}
        />
      </div>
    </div>
  );
}

function checkType(types: string[], target: string) {
  for (const type of types) {
    if (type === '*') return true;
    if (type === target) return true;
  }
  return false;
}
