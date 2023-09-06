'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import RectangleObjRenderer from './RectangleObjRenderer';
import TextObjRenderer from './TextObjRenderer';
import { useThree } from '@react-three/fiber';
import { getPos } from '@/utils/whiteboardHelper';
import SelectionRenderer from './SelectionRenderer';
import { MutableRefObject, memo, useRef } from 'react';
import LineObjRenderer from './LineObjRenderer';
import CircleObjRenderer from './CircleObjRenderer';
import GraphObjRenderer from './GraphObjRenderer';

export interface ObjRendererProps {
  rawObj: Obj;
  dimensionsRef?: MutableRefObject<ObjDimensions>;
}

interface NodeRendererProps {
  node: ObjNode;
}

export default function NodeRenderer({ node }: NodeRendererProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(node.objId));

  return (
    <>
      {obj === undefined ? <></> : <ObjectWrapper objId={node.objId} />}
      {node.childNodes.map((n) => {
        return <NodeRenderer key={n.objId} node={n} />;
      })}
    </>
  );
}

interface RenderWrapperProps {
  obj: Obj;
  dimensionsRef: MutableRefObject<ObjDimensions>;
}

function RenderWrapper({ obj, dimensionsRef }: RenderWrapperProps) {
  switch (obj.type) {
    case 'RECT':
      return <RectangleObjRenderer key={obj.objId} rawObj={obj} dimensionsRef={dimensionsRef} />;
    case 'TEXT':
      return <TextObjRenderer key={obj.objId} rawObj={obj} dimensionsRef={dimensionsRef} />;
    case 'LINE':
      return <LineObjRenderer key={obj.objId} rawObj={obj} dimensionsRef={dimensionsRef} />;
    case 'CIRCLE':
      return <CircleObjRenderer key={obj.objId} rawObj={obj} dimensionsRef={dimensionsRef} />;
    case 'GRAPH':
      return <GraphObjRenderer key={obj.objId} rawObj={obj} dimensionsRef={dimensionsRef} />;
  }
}

const MemoizedRenderWrapper = memo(
  RenderWrapper,
  (prev, next) => prev.obj.objId === next.obj.objId && prev.dimensionsRef === next.dimensionsRef,
);

interface ObjectWrapperProps {
  objId: string;
}

function ObjectWrapper({ objId }: ObjectWrapperProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId))!;
  const dimensionsRef = useRef<ObjDimensions>({ x: 0, y: 0, w: 0, h: 0 });
  const { currentObj, setCurrentObj, setDrag, currentTool } = useWhiteBoard((state) => ({
    currentObj: state.currentObj,
    setCurrentObj: state.setCurrentObj,
    setDrag: state.setDrag,
    currentTool: state.currentTool,
  }));
  const { mouse, camera } = useThree();
  const selection = currentObj === objId;

  return (
    <group
      onPointerDown={(e) => {
        // 첫번째 클릭만 여기서 처리, selection 이후는 selectionRenderer에서 처리
        e.stopPropagation();
        if (e.button === 0) {
          setCurrentObj(objId);
          if (selection) return;
          if (currentTool === 'SELECT') {
            const mousePos = getPos(mouse, camera);
            setDrag({
              mousePos: mousePos,
              mode: 'move',
              prevObj: obj,
            });
          }
        }
      }}
    >
      <MemoizedRenderWrapper obj={obj} dimensionsRef={dimensionsRef} />
      {selection ? <SelectionRenderer dimensionsRef={dimensionsRef} objId={objId} /> : <></>}
    </group>
  );
}
