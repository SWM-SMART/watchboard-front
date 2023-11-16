import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from './divider.module.css';

interface DividerProps {
  setDrag: Dispatch<SetStateAction<boolean>>;
}

export default function Divider({ setDrag }: DividerProps) {
  return (
    <div className={styles.handle} onMouseDown={() => setDrag(true)}>
      <span className={`material-symbols-outlined ${styles.icon}`}>drag_handle</span>
    </div>
  );
}

export function useDivider(left: boolean, defaultWidth: number, minWidth: number) {
  const [width, setWidth] = useState<number>(defaultWidth);
  const [drag, setDrag] = useState<boolean>(false);

  useEffect(() => {
    if (!drag) return;
    const pointerUp = () => setDrag(false);
    const pointerMove = (e: MouseEvent) =>
      setWidth(Math.max(left ? e.clientX - 6 : window.innerWidth - e.clientX + 6, minWidth));
    document.addEventListener('mousemove', pointerMove);
    document.addEventListener('mouseup', pointerUp);
    return () => {
      document.removeEventListener('mousemove', pointerMove);
      document.removeEventListener('mouseup', pointerUp);
    };
  }, [drag, left, minWidth]);

  return { width, setDrag };
}
