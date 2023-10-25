'use client';
import dynamic from 'next/dynamic';
import { ReactNode, SetStateAction, Suspense, useEffect, useState } from 'react';
import styles from './page.module.css';
import { getDocument } from '@/utils/api';
import LoadingScreen from '../../../components/LoadingScreen';
import OverlayWrapper from '@/components/OverlayWrapper';
import BottomToolBar from './components/BottomToolBar';
import { useViewer } from '@/states/viewer';
import PdfViewer from '@/components/PdfViewer';
import NodeInfo from '@/components/NodeInfo';
const GraphCanvas = dynamic(() => import('@/components/GraphCanvas'), { ssr: false });
import 'material-symbols';

interface DocumentPageProps {
  params: { documentId: string };
}

export default function DoucumentsPage({ params }: DocumentPageProps) {
  const [overlay, setOverlay] = useState<ReactNode | null>(null);
  const documentData = useDocument(parseInt(params.documentId));

  const resetViewer = useViewer((state) => state.reset);
  // reset viewer
  useEffect(() => {
    resetViewer();
  }, [resetViewer]);

  const [sideBarWidth, setSideBarWidth] = useState<number>(500);
  const [dividerActive, setDividerActive] = useState<boolean>(false);

  useEffect(() => {
    if (!dividerActive) return;
    const onPointerUp = () => setDividerActive(false);
    const onPointerMove = (e: MouseEvent) => {
      setSideBarWidth(e.clientX - 5);
    };
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointermove', onPointerMove);
    return () => {
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointermove', onPointerMove);
    };
  }, [dividerActive]);

  const selectedNode = useViewer((state) => state.selectedNode);

  if (documentData === null) return <LoadingScreen message={'Loading document'} />;

  return (
    <div className={styles.rootContainer}>
      <div className={styles.container}>
        <div
          className={styles.sideBar}
          style={{ width: `${sideBarWidth}px`, flex: `0 0 ${sideBarWidth}px` }}
        >
          <NodeInfo node={selectedNode} />
        </div>
        <div className={styles.divider} onPointerDown={() => setDividerActive(true)}>
          <span className={`material-symbols-outlined ${styles.icon}`}>drag_handle</span>
        </div>
        <div className={styles.content}>
          <SwitchView viewTypes={['HOME', 'DATA']}>
            <GraphViewer />
            <PdfViewer url={documentData.data.url} sideBar={true} />
          </SwitchView>
        </div>
      </div>
      <BottomToolBar />
    </div>
  );
}

function GraphViewer() {
  return (
    <>
      <div className={styles.whiteBoardContainer}>
        <Suspense fallback={<LoadingScreen message={'Loading renderer'} />}>
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

function useDocument(documentId: number) {
  const { document, setDocument } = useViewer((state) => ({
    document: state.document,
    setDocument: state.setDocument,
  }));

  useEffect(() => {
    (async () => {
      // get raw document data
      const newDocument = await getDocument(documentId);
      // construct tree
      setDocument(newDocument);
    })();
  }, [documentId, setDocument]);

  return document;
}
