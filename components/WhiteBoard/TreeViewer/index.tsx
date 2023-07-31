'use client';
import styles from './treeViewer.module.css';
import { objMapState } from '@/states/whiteboard';
import { useRecoilValue } from 'recoil';
import 'material-symbols';
import { useState } from 'react';
import { rootObj } from '../../../utils/whiteboardHelper';

const INDENT_SIZE = 10;

interface TreeViewerProps {
  root: ObjNode;
}

// object info tree
export default function TreeViewer({ root }: TreeViewerProps) {
  return (
    <div className={styles.container}>
      <TreeViewerNode node={root} depth={0} root={true} />
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
  const [expand, setExpand] = useState<boolean>(false);
  const objMap = useRecoilValue(objMapState);
  const obj = node.objId === 'ROOT' ? rootObj : objMap.get(node.objId);
  if (obj === undefined) return <></>;
  const leaf = !root && node.childNodes.length === 0;

  return (
    <div style={{ marginLeft: `${INDENT_SIZE * depth}px` }}>
      <div className={styles.nodeContainer}>
        <span
          className={`material-symbols-outlined ${styles.arrow} ${expand ? styles.expand : ''}`}
          onClick={() => {
            setExpand((previousExpand) => !previousExpand);
          }}
        >
          {leaf ? '' : 'arrow_drop_down'}
        </span>
        <span>{`type: ${obj.type} id:${obj.objId} x:${obj.x} y:${obj.y}`}</span>
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
