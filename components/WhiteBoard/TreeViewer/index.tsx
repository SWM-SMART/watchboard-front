'use client';
import styles from './treeViewer.module.css';
import 'material-symbols';
import { useState } from 'react';
import { rootObj } from '../../../utils/whiteboardHelper';
import { useWhiteBoard } from '@/states/whiteboard';

interface TreeViewerProps {
  root: ObjNode;
}

// object info tree
export default function TreeViewer({ root }: TreeViewerProps) {
  return (
    <div className={styles.container}>
      <TreeViewerNode key={`TreeViewer-object-${root.objId}`} node={root} depth={0} root={true} />
    </div>
  );
}

interface TreeViewerNodeProps {
  node: ObjNode;
  depth?: number;
  root?: boolean;
}

// recursively show object info
function TreeViewerNode({ node, depth = 0, root = false }: TreeViewerNodeProps) {
  const currentObj = useWhiteBoard((state) => state.currentObj);
  const [expand, setExpand] = useState<boolean>(true);
  const objMap = useWhiteBoard((state) => state.objMap);
  const obj = node.objId === 'ROOT' ? rootObj : objMap.get(node.objId);
  if (obj === undefined) return <></>;
  const leaf = !root && node.childNodes.length === 0;

  return (
    <div
      className={`${root ? '' : styles.nodeWithExpand} ${
        currentObj === obj.objId ? styles.currentObj : ''
      }`}
    >
      <div className={styles.nodeContainer}>
        <span
          className={`material-symbols-outlined ${styles.arrow} ${expand ? styles.expand : ''}`}
          onClick={() => {
            setExpand((previousExpand) => !previousExpand);
          }}
        >
          {leaf ? '' : 'expand_more'}
        </span>
        <ObjInfo obj={obj} />
      </div>
      {expand ? (
        node.childNodes.map((v) => {
          return <TreeViewerNode key={`TreeViewer-object-${v.objId}`} node={v} depth={depth + 1} />;
        })
      ) : (
        <></>
      )}
    </div>
  );
}

interface ObjInfoProps {
  obj: Obj;
}

function ObjInfo({ obj }: ObjInfoProps) {
  const setCurrentObj = useWhiteBoard((state) => state.setCurrentObj);
  return (
    <div className={styles.objInfoContainer} onClick={() => setCurrentObj(obj.objId)}>
      <span className={`material-symbols-outlined ${styles.objIcon}`}>{typeToIcon(obj.type)}</span>
      <p>{obj.objId}</p>
    </div>
  );
}

function typeToIcon(type: ObjType) {
  switch (type) {
    case 'RECT':
      return 'rectangle';
    case 'TEXT':
      return 'title';
    case 'ROOT':
      return 'dashboard';
    case 'LINE':
      return 'linear_scale';
  }
}
