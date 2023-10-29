import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import styles from './optionPanel.module.css';
import 'material-symbols';
import { useViewer } from '@/states/viewer';
import SmallIconButton from '@/components/Button/SmallIconButton';

const DEFAULT_WIDTH = 350;

interface OptionPanelProps {
  children?: ReactNode;
}

export default function OptionPanel({ children }: OptionPanelProps) {
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [drag, setDrag] = useState<boolean>(false);
  const { keywords, currentTool, setCurrentTool } = useViewer((state) => ({
    keywords: state.keywords,
    currentTool: state.currentTool,
    setCurrentTool: state.setCurrentTool,
  }));

  useEffect(() => {
    if (!drag) return;
    const pointerUp = () => setDrag(false);
    const pointerMove = (e: MouseEvent) =>
      setWidth(Math.max(window.innerWidth - e.clientX + 12, DEFAULT_WIDTH));
    document.addEventListener('pointermove', pointerMove);
    document.addEventListener('pointerup', pointerUp);
    return () => {
      document.removeEventListener('pointermove', pointerMove);
      document.removeEventListener('pointerup', pointerUp);
    };
  }, [drag]);

  const keys = Array.from(keywords.keys());

  return (
    <div className={styles.container} style={{ width: `${width}px` }}>
      <div
        className={styles.handle}
        onPointerDown={(e) => {
          setDrag(true);
        }}
      >
        <span className={`material-symbols-outlined ${styles.icon}`}>drag_handle</span>
      </div>
      <div className={styles.content}>
        <div className={styles.utils}>
          {children}
          <div className={styles.tools}>
            <SmallIconButton
              onClick={() => setCurrentTool('SELECT')}
              selected={currentTool === 'SELECT'}
              icon={'text_select_start'}
            />
            <SmallIconButton
              onClick={() => setCurrentTool('HIGHLIGHT')}
              selected={currentTool === 'HIGHLIGHT'}
              icon={'ink_highlighter'}
            />
          </div>
        </div>
        <div className={styles.keywords}>
          {keys.map((v) => (
            <KeywordView key={v} label={v} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface KeywordViewProps {
  label: string;
}

function KeywordView({ label }: KeywordViewProps) {
  const { enabled, setKeyword } = useViewer((state) => ({
    enabled: state.keywords.get(label),
    setKeyword: state.setKeyword,
  }));

  return (
    <div
      className={`${styles.keyword} ${enabled ? styles.enabled : ''}`}
      onClick={() => setKeyword(label, !enabled)}
    >
      {label}
    </div>
  );
}
