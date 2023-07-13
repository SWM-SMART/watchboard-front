'use client';
import { objMapState } from '@/states/whiteboard';
import { useRecoilValue } from 'recoil';

interface TreeViewerProps {
  root: ObjNode;
}

// object info tree
export default function TreeViewer({ root }: TreeViewerProps) {
  return (
    <div>
      <TreeViewerNode node={root} depth={0} />
    </div>
  );
}

interface TreeViewerNodeProps {
  node: ObjNode;
  depth?: number;
}

// recursively show object info
function TreeViewerNode({ node, depth = 0 }: TreeViewerNodeProps) {
  const objMap = useRecoilValue(objMapState);
  return (
    <div>
      <TreeViewerObject obj={objMap.get(node.objId)} />
      {node.childNodes.map((v) => {
        // TODO: depth에 따라 indent 추가
        return <TreeViewerNode key={`TreeViewer-object-${v.objId}`} node={v} depth={depth + 1} />;
      })}
    </div>
  );
}

interface TreeViewerObjectProps {
  obj: Obj | undefined;
}

// show object info
function TreeViewerObject({ obj }: TreeViewerObjectProps) {
  if (obj === undefined) return <></>;
  return <p>{`type: ${obj.type} id:${obj.objId} x:${obj.x} y:${obj.y}`}</p>;
}
