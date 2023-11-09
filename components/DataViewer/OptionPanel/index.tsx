import { ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react';
import styles from './optionPanel.module.css';
import 'material-symbols';
import { useViewer } from '@/states/viewer';
import SmallIconButton from '@/components/Button/SmallIconButton';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import { updateKeywords } from '@/utils/api';
import Divider, { useDivider } from '@/components/Divider';

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
      // wait for sync to finish
      // TODO: implement this
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
              ) : (
                <></>
              )}
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
  const { state, setKeyword } = useViewer((state) => ({
    state: state.keywords.get(label),
    setKeyword: state.setKeyword,
  }));

  if (state === undefined) return <></>;

  return (
    <div
      className={`${styles.keyword} ${state.enabled ? styles.enabled : ''}`}
      onClick={() => setKeyword(label, !state.enabled)}
    >
      {label}
    </div>
  );
}
