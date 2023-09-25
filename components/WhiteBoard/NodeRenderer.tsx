'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import { useThree } from '@react-three/fiber';
import { getPos } from '@/utils/whiteboardHelper';
import SelectionRenderer from './SelectionRenderer';
import { MutableRefObject, RefObject, memo, useRef } from 'react';
import { RectangleRenderer } from './RectangleObjRenderer';
import { TextRenderer } from './TextObjRenderer';
import { LineRenderer } from './LineObjRenderer';
import { CircleRenderer } from './CircleObjRenderer';
import { Group } from 'three';

export interface ObjRendererProps {
  rawObj: Obj;
  dimensionsRef?: MutableRefObject<ObjDimensions>;
  dimensions?: ObjDimensions;
}

export interface RendererProps {
  objId: string;
  dimensionsRef?: MutableRefObject<ObjDimensions>;
  groupRef?: RefObject<Group>;
}

interface NodeRendererProps {
  node: ObjNode;
}

export default function NodeRenderer({ node }: NodeRendererProps) {
  const objExists = useWhiteBoard((state) => state.objMap.get(node.objId) !== undefined);
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      {objExists ? <ObjectWrapper objId={node.objId} groupRef={groupRef} /> : <></>}
      {node.childNodes.map((n) => {
        return <NodeRenderer key={n.objId} node={n} />;
      })}
    </group>
  );
}

interface RenderWrapperProps {
  obj: Obj;
  dimensionsRef: MutableRefObject<ObjDimensions>;
  groupRef?: RefObject<Group>;
}

function RenderWrapper({ obj, dimensionsRef, groupRef }: RenderWrapperProps) {
  switch (obj.type) {
    case 'RECT':
      return (
        <RectangleRenderer
          key={obj.objId + obj.type}
          objId={obj.objId}
          dimensionsRef={dimensionsRef}
          groupRef={groupRef}
        />
      );
    case 'TEXT':
      return (
        <TextRenderer
          key={obj.objId + obj.type}
          objId={obj.objId}
          dimensionsRef={dimensionsRef}
          groupRef={groupRef}
        />
      );
    case 'LINE':
      return (
        <LineRenderer
          key={obj.objId + obj.type}
          objId={obj.objId}
          dimensionsRef={dimensionsRef}
          groupRef={groupRef}
        />
      );
    case 'CIRCLE':
      return (
        <CircleRenderer
          key={obj.objId + obj.type}
          objId={obj.objId}
          dimensionsRef={dimensionsRef}
          groupRef={groupRef}
        />
      );
  }
}

const MemoizedRenderWrapper = memo(
  RenderWrapper,
  (prev, next) =>
    prev.obj.objId === next.obj.objId &&
    prev.dimensionsRef === next.dimensionsRef &&
    prev.obj.type === next.obj.type &&
    prev.groupRef === next.groupRef,
);

interface ObjectWrapperProps {
  groupRef?: RefObject<Group>;
  objId: string;
}

function ObjectWrapper({ objId, groupRef }: ObjectWrapperProps) {
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
      <MemoizedRenderWrapper obj={obj} dimensionsRef={dimensionsRef} groupRef={groupRef} />
      {selection ? <SelectionRenderer dimensionsRef={dimensionsRef} objId={objId} /> : <></>}
    </group>
  );
}
