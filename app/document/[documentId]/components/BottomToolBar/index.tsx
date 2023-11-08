import styles from './bottomToolBar.module.css';
import { useEffect, useRef, useState } from 'react';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import { useViewer } from '@/states/viewer';
import 'material-symbols';
import SmallIconButton from '@/components/Button/SmallIconButton';
import { useRouter } from 'next/navigation';

export default function BottomToolBar() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Coord>({ x: 0, y: 0 });
  const [drag, setDrag] = useState<Coord | undefined>(undefined);

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
            e.clientY + drag.y,
            window.innerHeight - (elementRef.current?.offsetHeight ?? 0),
          ),
        ),
      });
    document.addEventListener('pointermove', pointerMove);
    document.addEventListener('pointerup', pointerUp);
    return () => {
      document.removeEventListener('pointermove', pointerMove);
      document.removeEventListener('pointerup', pointerUp);
    };
  }, [drag]);

  const { view, setView } = useViewer((state) => ({
    view: state.view,
    setView: state.setView,
  }));

  return (
    <div ref={elementRef} className={styles.container} style={{ left: pos.x, top: pos.y }}>
      <div
        className={styles.handle}
        onPointerDown={(e) => setDrag({ x: pos.x - e.clientX, y: pos.y - e.clientY })}
      >
        <span className={`material-symbols-outlined ${styles.icon}`}>drag_handle</span>
      </div>

      <Title />

      <ClickableBackgroundButton
        text={'마인드맵'}
        invert={view !== 'HOME'}
        onClick={() => setView('HOME')}
      />
      <ClickableBackgroundButton
        text={'자료'}
        invert={view !== 'DATA'}
        onClick={() => setView('DATA')}
      />
    </div>
  );
}

function Title() {
  const { title } = useViewer((state) => ({
    title: state.document?.documentName,
  }));
  const router = useRouter();

  return (
    <div className={styles.titleContainer}>
      <div className={styles.backToList} onClick={() => router.push('/')}>
        <span>문서</span>
        <span className={`material-symbols-outlined`}>chevron_right</span>
      </div>
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
