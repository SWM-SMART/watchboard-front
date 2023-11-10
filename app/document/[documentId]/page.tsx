'use client';
import dynamic from 'next/dynamic';
import { ReactNode, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import LoadingScreen from '../../../components/LoadingScreen';
import BottomToolBar from './components/BottomToolBar';
import { useViewer } from '@/states/viewer';
import PdfViewer from '@/components/DataViewer/PdfViewer';
import NodeInfo from '@/components/NodeInfo';
const GraphCanvas = dynamic(() => import('@/components/GraphCanvas'), { ssr: false });
import 'material-symbols';
import AudioViewer from '@/components/DataViewer/AudioViewer';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import { useViewerEvents } from '@/utils/ui';
import Divider, { useDivider } from '@/components/Divider';

interface DocumentPageProps {
  params: { documentId: string };
}

export default function DoucumentsPage({ params }: DocumentPageProps) {
  const documentId = parseInt(params.documentId);
  const { resetViewer, loadDocument, documentData, selectedNode, syncDocument } = useViewer(
    (state) => ({
      documentData: state.document,
      resetViewer: state.reset,
      loadDocument: state.loadDocument,
      selectedNode: state.selectedNode,
      syncDocument: state.syncDocument,
    }),
  );

  // reset viewer
  useEffect(() => {
    resetViewer();
    // load document
    loadDocument(documentId);
  }, [loadDocument, documentId, resetViewer]);

  const { width, setDrag } = useDivider(true, 800, 0);

  const eventCallback = useCallback(
    (type: ViewerEventType) => {
      // reload on event
      if (documentData === null) return loadDocument(documentId);
      // TODO: implement other types of events
      syncDocument();
    },
    [documentData, documentId, loadDocument, syncDocument],
  );

  // subscribe to events
  useViewerEvents(documentId, eventCallback);

  if (documentData === null) return <LoadingScreen message={'요약 마인드맵 로드중'} />;

  return (
    <div className={styles.rootContainer}>
      <div className={styles.container}>
        <div className={styles.sideBar} style={{ width: `${width}px`, flex: `0 0 ${width}px` }}>
          <NodeInfo node={selectedNode} />
        </div>
        <Divider setDrag={setDrag} />
        <div className={styles.content}>
          <SwitchView viewTypes={['HOME', 'DATA']}>
            <GraphViewer />
            <DataViewer type={documentData.dataType} />
          </SwitchView>
        </div>
      </div>
      <BottomToolBar />
      <UpdateAlert />
    </div>
  );
}

function UpdateAlert() {
  const { ready, apply } = useViewer((state) => ({
    ready: state.nextState !== null,
    apply: state.applySyncDocument,
  }));
  const [open, setOpen] = useState<boolean>(false);
  useEffect(() => {
    setOpen(ready);
    return () => setOpen(false);
  }, [ready]);

  if (!ready) return <></>;

  return (
    <div
      className={`${styles.alertContainer} `}
      style={{ transform: open ? 'translateX(0)' : 'translateX(100%) translateX(-24px)' }}
    >
      <span
        style={{ cursor: 'pointer' }}
        className={`material-symbols-outlined ${styles.icon}`}
        onClick={() => setOpen((open) => !open)}
      >
        drag_handle
      </span>
      <div className={styles.alertContent}>
        <p>{'변경사항이 반영된 마인드맵이 준비되었습니다!'}</p>
        <ClickableBackgroundButton invert={true} text={'적용'} onClick={() => apply()} />
      </div>
    </div>
  );
}

interface DataViewerProps {
  type: WBSourceDataType;
}

function DataViewer({ type }: DataViewerProps) {
  const dataSource = useViewer((state) => state.dataSource);
  if (dataSource === null) return <></>;
  switch (type) {
    case 'pdf':
      return <PdfViewer dataSource={dataSource} />;
    case 'audio':
      return <AudioViewer dataSource={dataSource} />;
  }
}

function GraphViewer() {
  const hasGraph = useViewer((state) => state.mindMapData?.keywords.length !== 0);
  if (!hasGraph) return <p>no graph available</p>;
  return (
    <>
      <div className={styles.whiteBoardContainer}>
        <Suspense fallback={<LoadingScreen message={'렌더러 로드중'} />}>
          <GraphCanvas />
        </Suspense>
      </div>
    </>
  );
}

interface SwitchViewProps {
  children: ReactNode[];
  viewTypes: ViewerPage[];
}

function SwitchView({ children, viewTypes }: SwitchViewProps) {
  const view = useViewer((state) => state.view);
  return (
    <>
      {children.map((v, i) => {
        return (
          <div
            key={`view_${viewTypes[i]}`}
            className={styles.container}
            style={viewTypes[i] !== view ? { display: 'none' } : undefined}
          >
            {v}
          </div>
        );
      })}
    </>
  );
}
