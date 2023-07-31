'use client';
import { useRecoilValue } from 'recoil';
import { objMapState } from '@/states/whiteboard';
import RectangleRenderer from './RectangleRenderer';
import TextRenderer from './TextRenderer';

interface NodeRendererProps {
  node: ObjNode;
}

export default function NodeRenderer({ node }: NodeRendererProps) {
  const objMap = useRecoilValue(objMapState);
  const current = objMap.get(node.objId);

  return (
    <>
      {current === undefined ? <></> : <ObjectWrapper obj={current} />}
      {node.childNodes.map((n) => {
        return <NodeRenderer key={n.objId} node={n} />;
      })}
    </>
  );
}

interface ObjectWrapperProps {
  obj: Obj;
}

export function ObjectWrapper({ obj }: ObjectWrapperProps) {
  switch (obj.type) {
    case 'RECT':
      return <RectangleRenderer key={obj.objId} obj={obj as RectObj} />;
    case 'TEXT':
      return <TextRenderer key={obj.objId} obj={obj as TextObj} />;
  }
}
