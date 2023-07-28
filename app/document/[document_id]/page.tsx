'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { getDocument } from '../../../utils/api';
import DocumentTitle from '../../../components/Document/DocumentTitle';
import ActionButtonGroup from '../../../components/Document/ActionButtonGroup';
import Tab from '../../../components/Document/Tab';
import ObjectPropertyEditor from '../../../components/WhiteBoard/ObjectPropertyEditor';
import TreeViewer from '../../../components/WhiteBoard/TreeViewer';
import { currentObjState, objMapState, objTreeState } from '../../../states/whiteboard';
import { useRecoilState, useRecoilValue } from 'recoil';
import ToolSelector from '../../../components/WhiteBoard/ToolSelector';
import WhiteBoard from '../../../components/WhiteBoard';
import { constructRootObjTree } from '../../../utils/whiteboardHelper';

interface DocumentPageProps {
  params: { document_id: string };
}

function useDocument(document_id: number) {
  const [document, setDocument] = useState<WBDocument | null>(null);
  const [_objTree, setObjTree] = useRecoilState(objTreeState);
  const [_objMap, setObjMap] = useRecoilState(objMapState);

  useEffect(() => {
    (async () => {
      // get raw document data
      const newDocument = await getDocument(document_id);
      const newObjMap = new Map<string, Obj>(Object.entries(newDocument.document_data));
      const newObjTree = constructRootObjTree(newObjMap);

      // construct tree
      setDocument(newDocument);
      setObjMap(newObjMap);
      setObjTree(newObjTree);
    })();
  }, [document_id, setObjMap, setObjTree]);

  return document;
}

export default function DoucumentsPage({ params }: DocumentPageProps) {
  const document = useDocument(parseInt(params.document_id));
  const obj = useRecoilValue(currentObjState);
  const tree = useRecoilValue(objTreeState);

  if (document === null) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <div className={styles.sideBarUp}>
          <DocumentTitle document_name={document.document_name} />
          <ActionButtonGroup />
        </div>
        <Tab labels={['속성', '레이어']}>
          <ObjectPropertyEditor targetObjId={obj} />
          <TreeViewer root={tree} />
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
