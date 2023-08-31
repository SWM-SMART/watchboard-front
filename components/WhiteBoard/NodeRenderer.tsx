'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import RectangleRenderer from './RectangleRenderer';
import TextRenderer from './TextRenderer';
import { useThree } from '@react-three/fiber';
import { getPos } from '@/utils/whiteboardHelper';
import SelectionRenderer from './SelectionRenderer';
import { MutableRefObject, memo, useRef } from 'react';
import LineRenderer from './LineRenderer';
import CircleRenderer from './CircleRenderer';

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
  objId: string;
  type: ObjType;
  dimensionsRef: MutableRefObject<ObjDimensions>;
}

function RenderWrapper({ objId, type, dimensionsRef }: RenderWrapperProps) {
  switch (type) {
    case 'RECT':
      return <RectangleRenderer key={objId} objId={objId} dimensionsRef={dimensionsRef} />;
    case 'TEXT':
      return <TextRenderer key={objId} objId={objId} dimensionsRef={dimensionsRef} />;
    case 'LINE':
      return <LineRenderer key={objId} objId={objId} dimensionsRef={dimensionsRef} />;
    case 'CIRCLE':
      return <CircleRenderer key={objId} objId={objId} dimensionsRef={dimensionsRef} />;
  }
}

const MemoizedRenderWrapper = memo(
  RenderWrapper,
  (prev, next) => prev.objId === next.objId && prev.dimensionsRef === next.dimensionsRef,
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
  const selection = currentObj === obj.objId;
  return (
    <group
      onPointerDown={(e) => {
        // 첫번째 클릭만 여기서 처리, selection 이후는 selectionRenderer에서 처리
        e.stopPropagation();
        if (e.button === 0) {
          setCurrentObj(obj.objId);
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
      <MemoizedRenderWrapper objId={objId} type={obj.type} dimensionsRef={dimensionsRef} />
      {selection ? <SelectionRenderer dimensionsRef={dimensionsRef} objId={objId} /> : <></>}
    </group>
  );
}
