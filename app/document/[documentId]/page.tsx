'use client';
import dynamic from 'next/dynamic';
import { ReactNode, Suspense, useEffect, useState } from 'react';
import styles from './page.module.css';
import { getDocument } from '@/utils/api';
import LoadingScreen from '../../../components/LoadingScreen';
import BottomToolBar from './components/BottomToolBar';
import { useViewer } from '@/states/viewer';
import PdfViewer from '@/components/DataViewer/PdfViewer';
import NodeInfo from '@/components/NodeInfo';
const GraphCanvas = dynamic(() => import('@/components/GraphCanvas'), { ssr: false });
import 'material-symbols';

interface DocumentPageProps {
  params: { documentId: string };
}

export default function DoucumentsPage({ params }: DocumentPageProps) {
  const { resetViewer, dataSource, loadDocument, documentData } = useViewer((state) => ({
    documentData: state.document,
    resetViewer: state.reset,
    dataSource: state.dataSource,
    loadDocument: state.loadDocument,
  }));

  // reset viewer
  useEffect(() => {
    resetViewer();
    // load document
    loadDocument(parseInt(params.documentId));
  }, [loadDocument, params.documentId, resetViewer]);

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
            <DataViewer type={documentData.dataType} />
          </SwitchView>
        </div>
      </div>
      <BottomToolBar />
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
    case 'none':
  }
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
