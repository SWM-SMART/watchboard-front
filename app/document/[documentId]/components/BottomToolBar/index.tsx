import styles from './bottomToolBar.module.css';
import { useEffect, useRef, useState } from 'react';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import { useViewer } from '@/states/viewer';
import 'material-symbols';
import SmallIconButton from '@/components/Button/SmallIconButton';
import { useOverlay } from '@/states/overlay';
import MixModePanel from '@/components/GraphCanvas/MixModePanel';

export default function BottomToolBar() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Coord>({ x: 0, y: 0 });
  const [drag, setDrag] = useState<Coord | undefined>(undefined);
  const setOverlay = useOverlay((state) => state.setOverlay);

  useEffect(() => {
    if (!drag) return;
    const pointerUp = () => setDrag(undefined);
    const pointerMove = (e: MouseEvent) =>
      setPos({
        x: Math.max(
          0,
          Math.min(e.clientX + drag.x, window.innerWidth - (elementRef.current?.offsetWidth ?? 0)),
        ),
        y: Math.max(
          0,
          Math.min(
            window.innerHeight - e.clientY + drag.y,
            window.innerHeight - (elementRef.current?.offsetHeight ?? 0),
          ),
        ),
      });

    document.addEventListener('mousemove', pointerMove);
    document.addEventListener('mouseup', pointerUp);
    return () => {
      document.removeEventListener('mousemove', pointerMove);
      document.removeEventListener('mouseup', pointerUp);
    };
  }, [drag]);

  const { view, setView } = useViewer((state) => ({
    view: state.view,
    setView: state.setView,
  }));

  return (
    <div className={styles.outer} style={{ left: pos.x, bottom: pos.y }} ref={elementRef}>
      <div className={styles.container}>
        <div
          className={styles.handle}
          onMouseDown={(e) =>
            setDrag({ x: pos.x - e.clientX, y: pos.y - (window.innerHeight - e.clientY) })
          }
        >
          <span className={`material-symbols-outlined ${styles.icon}`}>drag_handle</span>
        </div>
        <Title />
        <ClickableBackgroundButton
          color={view === 'HOME' ? 'primary' : 'grey'}
          thin={true}
          text={'마인드맵'}
          invert={true}
          onClick={() => setView('HOME')}
        />
        <ClickableBackgroundButton
          color={view === 'DATA' ? 'primary' : 'grey'}
          thin={true}
          text={'자료'}
          invert={true}
          onClick={() => setView('DATA')}
        />
        <ClickableBackgroundButton
          color={'primary'}
          thin={true}
          text={'MIX!'}
          invert={false}
          onClick={() => setOverlay(<MixModePanel />)}
        />
      </div>
    </div>
  );
}

function Title() {
  const { title } = useViewer((state) => ({
    title: state.document?.documentName,
  }));

  return (
    <div className={styles.titleContainer}>
      <p className={styles.title}>{title}</p>
    </div>
  );
}

function Search() {
  const { query, setQuery } = useViewer((state) => ({
    query: state.searchQuery,
    setQuery: state.setSearchQuery,
  }));
  const inputRef = useRef<HTMLInputElement>(null);
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (enabled) inputRef.current?.focus();
  }, [enabled]);

  return (
    <div className={styles.searchContainer}>
      <input
        onBlur={() => setEnabled(false)}
        ref={inputRef}
        style={{ display: enabled ? 'block' : 'none' }}
        className={styles.input}
        type="text"
        onChange={(e) => setQuery(e.target.value)}
        value={query}
      />
      <SmallIconButton icon={'search'} selected={false} onClick={() => setEnabled(true)} />
    </div>
  );
}
