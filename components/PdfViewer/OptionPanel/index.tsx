import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from './optionPanel.module.css';
import 'material-symbols';
import { useViewer } from '@/states/viewer';
import SmallIconButton from '@/components/Button/SmallIconButton';

const DEFAULT_WIDTH = 300;
const SCALE_MAX = 10;
const SCALE_MIN = 1;

interface OptionPanelProps {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  scale: number;
  setScale: Dispatch<SetStateAction<number>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  numPages: number;
}

export default function OptionPanel({
  currentTool,
  setCurrentTool,
  scale,
  setScale,
  page,
  setPage,
  numPages,
}: OptionPanelProps) {
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [drag, setDrag] = useState<boolean>(false);
  const keywords = useViewer((state) => state.keywords);

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
          <div className={styles.documentControls}>
            <SmallIconButton
              icon="zoom_out"
              selected={false}
              onClick={() => {
                setScale((scale) => Math.max(scale - 0.1, SCALE_MIN));
              }}
            />
            <p style={{ width: '50px' }}>{`${Math.round(scale * 100)}%`}</p>
            <SmallIconButton
              icon="zoom_in"
              selected={false}
              onClick={() => {
                setScale((scale) => Math.min(scale + 0.1, SCALE_MAX));
              }}
            />
            <p>|</p>
            <SmallIconButton
              icon="navigate_before"
              selected={false}
              onClick={() => {
                setPage((page) => {
                  const newPage = page - 1;
                  if (newPage < 0) return 0;
                  return newPage;
                });
              }}
            />
            <p style={{ width: '50px' }}>{page + 1}</p>
            <SmallIconButton
              icon="navigate_next"
              selected={false}
              onClick={() => {
                setPage((page) => {
                  const newPage = page + 1;
                  if (newPage >= numPages) return numPages - 1;
                  return newPage;
                });
              }}
            />
          </div>
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
