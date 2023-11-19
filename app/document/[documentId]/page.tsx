'use client';
import dynamic from 'next/dynamic';
import { ReactNode, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import Divider, { useDivider } from '@/components/Divider';
import { useToast } from '@/states/toast';
import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill';
import { createDocumentEventSource } from '@/utils/api';
import { useViewerEvent } from '@/utils/ui';
import { useRouter } from 'next/navigation';

interface DocumentPageProps {
  params: { documentId: string };
}

export default function DoucumentsPage({ params }: DocumentPageProps) {
  const documentId = params.documentId === 'demo' ? -1 : parseInt(params.documentId);
  const { resetViewer, loadDocument, documentData, selectedNode, syncDocument } = useViewer(
    (state) => ({
      documentData: state.document,
      resetViewer: state.reset,
      loadDocument: state.loadDocument,
      selectedNode: state.selectedNode,
      syncDocument: state.syncDocument,
    }),
  );
  const pushToast = useToast((state) => state.pushToast);
  const router = useRouter();

  // reset viewer
  useEffect(() => {
    // is demo
    if (documentId < 0)
      pushToast({
        id: new Date().getTime(),
        duraton: 10000,
        msg: '현재 문서는 예시 문서 입니다.',
      });
    resetViewer();
    // load document
    loadDocument(documentId).then((success) => {
      // handle error
      if (success) return;
      router.push('/');
      pushToast({
        id: new Date().getTime(),
        duraton: 3000,
        msg: '해당 문서에 대한 권한이 없습니다!',
      });
    });
  }, [loadDocument, documentId, resetViewer, pushToast, router]);

  // create mainEventSource
  useEffect(() => {
    const documentEventSource = createDocumentEventSource(documentId);
    return () => documentEventSource?.close();
  }, [documentId]);

  const { width, setDrag } = useDivider(true, 800, 0);

  // handle events
  const eventCallback = useCallback(
    (type: ViewerEventType, data: string) => {
      // reload on event
      if (type === 'mindmap') {
        // mindmap reload
        if (documentData === null) return loadDocument(documentId);
        // mindmap updated
        return syncDocument();
      }
    },
    [documentData, documentId, loadDocument, syncDocument],
  );

  useViewerEvent(eventCallback, documentId);

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
      className={styles.alertContainer}
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
  const mindMapData = useViewer((state) => state.mindMapData);
  if (mindMapData === null) return <p>no graph available</p>;
  return (
    <>
      <div className={styles.whiteBoardContainer}>
        <Suspense fallback={<LoadingScreen message={'렌더러 로드중'} />}>
          <GraphCanvas mindMapData={mindMapData} />
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
