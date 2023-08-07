'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { getDocument } from '../../../utils/api';
import DocumentTitle from './components/DocumentTitle';
import ActionButtonGroup from './components/ActionButtonGroup';
import Tab from './components/Tab';
import ObjectPropertyEditor from '../../../components/WhiteBoard/ObjectPropertyEditor';
import TreeViewer from '../../../components/WhiteBoard/TreeViewer';
import { useWhiteBoard } from '../../../states/whiteboard';
import ToolSelector from '../../../components/WhiteBoard/ToolSelector';
import WhiteBoard from '../../../components/WhiteBoard';
import { constructRootObjTree } from '../../../utils/whiteboardHelper';

interface DocumentPageProps {
  params: { documentId: string };
}

function useDocument(documentId: number) {
  const [document, setDocument] = useState<WBDocument | null>(null);
  const loadDocument = useWhiteBoard((state) => state.loadDocument);

  useEffect(() => {
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

export default function DoucumentsPage({ params }: DocumentPageProps) {
  const document = useDocument(parseInt(params.documentId));
  const { currentObj, objTree } = useWhiteBoard((state) => ({
    currentObj: state.currentObj,
    objTree: state.objTree,
  }));

  if (document === null) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <div className={styles.sideBarUp}>
          <DocumentTitle documentName={document.documentName} />
          <ActionButtonGroup />
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
          <WhiteBoard />
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return <h1>loading</h1>;
}
