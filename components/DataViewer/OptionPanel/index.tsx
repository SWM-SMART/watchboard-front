import { ReactNode, useEffect, useMemo, useState } from 'react';
import styles from './optionPanel.module.css';
import 'material-symbols';
import { useViewer } from '@/states/viewer';
import SmallIconButton from '@/components/Button/SmallIconButton';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import { updateKeywords } from '@/utils/api';
import Divider, { useDivider } from '@/components/Divider';
import { ContextMenuItem, useContextMenu } from '@/states/contextMenu';

const DEFAULT_WIDTH = 350;

interface OptionPanelProps {
  children?: ReactNode;
}

export default function OptionPanel({ children }: OptionPanelProps) {
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false);
  const { keywords, currentTool, setCurrentTool, documentId, clearSyncDocument, nextState } =
    useViewer((state) => ({
      keywords: state.keywords,
      currentTool: state.currentTool,
      setCurrentTool: state.setCurrentTool,
      documentId: state.document?.documentId,
      clearSyncDocument: state.clearSyncDocument,
      nextState: state.nextState,
    }));

  useEffect(() => {
    // on nextMindmap load complete, disable sync in progress
    if (nextState !== null) setSyncInProgress(false);
  }, [nextState]);

  const { width, setDrag } = useDivider(false, DEFAULT_WIDTH, DEFAULT_WIDTH);

  const [stableKeys, addedKeys, removedKeys] = useMemo(() => {
    const stable: string[] = [];
    const added: string[] = [];
    const removed: string[] = [];
    for (const [k, v] of keywords.entries()) {
      if (v.type === 'STABLE') stable.push(k);
      else if (v.type === 'ADD') added.push(k);
      else if (v.type === 'DELETE') removed.push(k);
    }
    return [stable, added, removed];
  }, [keywords]);

  const syncKeywords = () => {
    if (documentId === undefined) return;
    setSyncInProgress(true);
    (async () => {
      // clear prev document
      clearSyncDocument();
      // sync local changes
      await updateKeywords(documentId, addedKeys, removedKeys);
    })();
  };

  return (
    <div className={styles.container} style={{ width: `${width}px` }}>
      <Divider setDrag={setDrag} />
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
        <div className={styles.keywordsContainer}>
          <div
            className={styles.keywords}
            style={syncInProgress ? { pointerEvents: 'none', opacity: '0.5' } : undefined}
          >
            <KeywordHeader label={`변경 사항 (${addedKeys.length + removedKeys.length})`}>
              {addedKeys.length + removedKeys.length > 0 ? (
                <ClickableBackgroundButton
                  text={'변경 사항 적용'}
                  icon={'sync'}
                  onClick={syncKeywords}
                />
              ) : null}
            </KeywordHeader>
            {addedKeys.map((v) => (
              <KeywordView key={v} label={v} />
            ))}
            {removedKeys.map((v) => (
              <KeywordView key={v} label={v} />
            ))}
          </div>
          <div className={styles.keywords}>
            <KeywordHeader label={`키워드 (${stableKeys.length})`} />
            {stableKeys.map((v) => (
              <KeywordView key={v} label={v} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface KeywordHeaderProps {
  label: string;
  children?: ReactNode;
}

function KeywordHeader({ label, children }: KeywordHeaderProps) {
  return (
    <div className={styles.keywordHeaderContainer}>
      <p className={styles.keywordsHeader}>{label}</p>
      <div className={styles.keywordHeaderActions}>{children}</div>
    </div>
  );
}

interface KeywordViewProps {
  label: string;
}

function KeywordView({ label }: KeywordViewProps) {
  const setMenu = useContextMenu((state) => state.setMenu);
  const { state, setKeyword, deleteKeyword } = useViewer((state) => ({
    state: state.keywords.get(label),
    setKeyword: state.setKeyword,
    deleteKeyword: state.deleteKeyword,
  }));

  const items = useMemo(() => {
    const trimmedLabel = label.substring(0, 10);
    const items: ContextMenuItem[] = [];
    if (state === undefined) return items;
    switch (state.type) {
      case 'ADD':
        items.push({
          label: `'${trimmedLabel}' 추가 취소`,
          onClick: () => deleteKeyword(label),
        });
        break;
      case 'STABLE':
        items.push({
          label: `'${trimmedLabel}' 삭제`,
          onClick: () => setKeyword(label, { enabled: false, type: 'DELETE' }),
        });
        break;
      case 'DELETE':
        items.push({
          label: `'${trimmedLabel}' 삭제 취소`,
          onClick: () => setKeyword(label, { ...state, type: 'STABLE' }),
        });
        break;
    }

    return items;
  }, [deleteKeyword, label, setKeyword, state]);

  if (state === undefined) return <></>;

  const icon = typeToIcon(state.type);

  return (
    <div
      className={`${styles.keyword} ${state.enabled ? styles.enabled : ''}`}
      onClick={() => setKeyword(label, { ...state, enabled: !state.enabled })}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenu({
          items: items,
          position: { x: e.clientX, y: e.clientY },
        });
      }}
    >
      {icon !== undefined ? (
        <span className={`material-symbols-outlined ${styles.keywordIcon}`}>{icon}</span>
      ) : null}
      {label}
    </div>
  );
}

function typeToIcon(type: KeywordType) {
  switch (type) {
    case 'ADD':
      return 'add';
    case 'STABLE':
      return undefined;
    case 'DELETE':
      return 'remove';
  }
}
