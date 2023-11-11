'use client';
import { useViewer } from '@/states/viewer';
import styles from './mixModePanel.module.css';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import { useDocument } from '@/states/document';
import { useOverlay } from '@/states/overlay';
import { useEffect, useState } from 'react';
import { getMindMapData } from '@/utils/api';

export default function MixModePanel() {
  const { mindMapData, setMindMapData, currentDocumentId } = useViewer((state) => ({
    currentDocumentId: state.document?.documentId ?? -1,
    mindMapData: state.mindMapData,
    setMindMapData: state.setMindMapData,
  }));

  const { documentList, fetchDocumentList } = useDocument((state) => ({
    documentList: state.documentList,
    fetchDocumentList: state.fetchDocumentList,
  }));

  const [selection, setSelection] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    fetchDocumentList();
  }, [fetchDocumentList]);

  const setOverlay = useOverlay((state) => state.setOverlay);

  if (mindMapData === null) return <></>;

  const applyChanges = () => {
    // loading dialogue
    setOverlay(<LoadingDialogue />);
    // current mindmap
    const fixedMindMap = mindMapData.get(currentDocumentId);
    if (fixedMindMap === undefined) return;
    // create new mindmap state
    const newMindMapData = new Map<number, GraphData>();
    newMindMapData.set(currentDocumentId, fixedMindMap);
    (async () => {
      // fetch new Mindmaps
      for (const [id, v] of selection.entries()) {
        if (v === false) continue;
        const newData = await getMindMapData(id);
        if (newData === null) continue;
        newMindMapData.set(id, newData);
      }
      // apply new state
      setMindMapData(newMindMapData);
      // close dialogue
      setOverlay(null);
    })();
  };

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <p>현재 {mindMapData.size}개의 문서 동시에 보는중 </p>
        <ClickableBackgroundButton
          color="primary"
          invert={true}
          text={'목록 새로고침'}
          icon="refresh"
          onClick={() => fetchDocumentList()}
        />
        <ClickableBackgroundButton
          color="primary"
          text="적용"
          icon="check"
          onClick={() => applyChanges()}
        />
        <ClickableBackgroundButton
          color="grey"
          text="닫기"
          icon="close"
          onClick={() => setOverlay(null)}
        />
      </div>
      <div className={styles.content}>
        {documentList.map((v) => {
          const selected =
            (mindMapData.get(v.documentId) !== undefined &&
              selection.get(v.documentId) === undefined) ||
            selection.get(v.documentId) === true;
          const fixed = v.documentId === currentDocumentId;
          return (
            <MiniCard
              key={v.documentId}
              document={v}
              state={fixed ? 'fixed' : selected ? 'selected' : 'unselected'}
              onClick={() => {
                if (!fixed) setSelection((state) => new Map([...state, [v.documentId, !selected]]));
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

type MinCardState = 'selected' | 'fixed' | 'unselected';

interface MiniCardProps {
  document: WBDocument;
  state: MinCardState;
  onClick: () => void;
}

function MiniCard({ document, state, onClick }: MiniCardProps) {
  return (
    <div
      className={`${styles.card} ${
        state === 'selected' ? styles.selected : state === 'fixed' ? styles.fixed : null
      }`}
      onClick={onClick}
    >
      <p className={styles.cardText}>{document.documentName}</p>
    </div>
  );
}

function LoadingDialogue() {
  return (
    <div className={styles.container}>
      <p className={styles.cardText}>요청한 문서들을 불러오는 중입니다. 잠시만 기다려 주세요.</p>
    </div>
  );
}
