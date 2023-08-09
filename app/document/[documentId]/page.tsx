'use client';
import dynamic from 'next/dynamic';
import { ReactNode, Suspense, useEffect, useState } from 'react';
import styles from './page.module.css';
import { useWhiteBoard } from '@/states/whiteboard';
import { getDocument } from '@/utils/api';
import DocumentTitle from './components/DocumentTitle';
import ActionButtonGroup from './components/ActionButtonGroup';
import Tab from './components/Tab';
import ObjectPropertyEditor from '@/components/WhiteBoard/ObjectPropertyEditor';
import TreeViewer from '@/components/WhiteBoard/TreeViewer';
import ToolSelector from '@/components/WhiteBoard/ToolSelector';
import LoadingScreen from '../../../components/LoadingScreen';
import OverlayWrapper from '@/components/OverlayWrapper';
const WhiteBoard = dynamic(() => import('@/components/WhiteBoard'), { ssr: false });

interface DocumentPageProps {
  params: { documentId: string };
}

export default function DoucumentsPage({ params }: DocumentPageProps) {
  const { currentObj, objTree, resetWhiteBoard } = useWhiteBoard((state) => ({
    currentObj: state.currentObj,
    objTree: state.objTree,
    resetWhiteBoard: state.resetWhiteBoard,
  }));

  const document = useDocument(parseInt(params.documentId));

  const [overlay, setOverlay] = useState<ReactNode | null>(null);

  // reset whiteboard
  useEffect(() => {
    resetWhiteBoard();
  }, [resetWhiteBoard]);

  if (document === null) return <LoadingScreen message={'Loading document'} />;

  return (
    <div className={styles.rootContainer}>
      <div className={styles.container}>
        <div className={styles.sideBar}>
          <div className={styles.sideBarUp}>
            <DocumentTitle documentName={document.documentName} />
            <ActionButtonGroup setOverlay={setOverlay} />
          </div>
          <Tab labels={['속성', '레이어']}>
            <ObjectPropertyEditor key={currentObj} targetObjId={currentObj} />
            <TreeViewer root={objTree} />
          </Tab>
        </div>
        <div className={styles.content}>
          <div className={styles.toolBar}>
            <ToolSelector />
          </div>
          <div className={styles.whiteBoardContainer}>
            <Suspense fallback={<LoadingScreen message={'Loading renderer'} />}>
              <WhiteBoard />
            </Suspense>
          </div>
        </div>
      </div>
      <OverlayWrapper>{overlay}</OverlayWrapper>
    </div>
  );
}

function useDocument(documentId: number) {
  const [document, setDocument] = useState<WBDocument | null>(null);
  const loadDocument = useWhiteBoard((state) => state.loadDocument);

  useEffect(() => {
    // reset
    setDocument(null);

    (async () => {
      // get raw document data
      const newDocument = await getDocument(documentId);

      // construct tree
      loadDocument(newDocument);
      setDocument(newDocument);
    })();
  }, [documentId, loadDocument]);

  return document;
}
