import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from './BottomPanel.module.css';
import { SmallIconButton, ToolButton } from '@/components/WhiteBoard/ToolSelector';
import 'material-symbols';

const DEFAULT_HEIGHT = 66;
const SCALE_MAX = 10;
const SCALE_MIN = 1;

interface BottomPanelProps {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  keywords: string[];
  setKeywords: Dispatch<SetStateAction<string[]>>;
  scale: number;
  setScale: Dispatch<SetStateAction<number>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  numPages: number;
}

export default function BottomPanel({
  currentTool,
  setCurrentTool,
  keywords,
  setKeywords,
  scale,
  setScale,
  page,
  setPage,
  numPages,
}: BottomPanelProps) {
  const [height, setHeight] = useState<number>(DEFAULT_HEIGHT);
  const [drag, setDrag] = useState<boolean>(false);

  useEffect(() => {
    if (!drag) return;
    const pointerUp = () => setDrag(false);
    const pointerMove = (e: MouseEvent) =>
      setHeight(Math.max(window.innerHeight - e.clientY + 10, DEFAULT_HEIGHT));
    document.addEventListener('pointermove', pointerMove);
    document.addEventListener('pointerup', pointerUp);
    return () => {
      document.removeEventListener('pointermove', pointerMove);
      document.removeEventListener('pointerup', pointerUp);
    };
  }, [drag]);

  return (
    <div
      className={styles.container}
      style={{
        height: height === -1 ? '50%' : height,
        transition: drag ? 'none' : 'height 0.3s ease-in-out',
      }}
    >
      <div
        className={styles.handle}
        onPointerDown={(e) => {
          setDrag(true);
        }}
      >
        <span
          className={`material-symbols-outlined ${styles.icon}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            setHeight((height) => (height === DEFAULT_HEIGHT ? -1 : DEFAULT_HEIGHT));
          }}
        >
          {height === DEFAULT_HEIGHT ? 'expand_less' : 'expand_more'}
        </span>
      </div>
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
          <ToolButton
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            toolName={'SELECT'}
            icon={'text_select_start'}
          />
          <ToolButton
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            toolName={'HIGHLIGHT'}
            icon={'ink_highlighter'}
          />
        </div>
      </div>

      <div className={styles.keywords}>
        {keywords.map((v) => (
          <Keyword
            key={v}
            label={v}
            onClick={() => {
              setKeywords((keywords) => keywords.filter((k) => k !== v));
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface KeywordProps {
  label: string;
  onClick?: () => void;
}

function Keyword({ label, onClick }: KeywordProps) {
  return (
    <div className={styles.keyword} onClick={onClick}>
      {label}
    </div>
  );
}
