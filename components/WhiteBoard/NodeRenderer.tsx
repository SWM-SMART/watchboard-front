'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import RectangleRenderer from './RectangleRenderer';
import TextRenderer from './TextRenderer';
import { useThree } from '@react-three/fiber';
import { getPos } from '@/utils/whiteboardHelper';
import SelectionRenderer from './SelectionRenderer';
import { Dispatch, SetStateAction, useState } from 'react';

interface NodeRendererProps {
  node: ObjNode;
}

export default function NodeRenderer({ node }: NodeRendererProps) {
  const objMap = useWhiteBoard((state) => state.objMap);
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

interface RenderWrapperProps {
  obj: Obj;
  setDimensions: Dispatch<SetStateAction<ObjDimensions>>;
}

function RenderWrapper({ obj, setDimensions }: RenderWrapperProps) {
  switch (obj.type) {
    case 'RECT':
      return (
        <RectangleRenderer key={obj.objId} obj={obj as RectObj} setDimensions={setDimensions} />
      );
    case 'TEXT':
      return <TextRenderer key={obj.objId} obj={obj as TextObj} setDimensions={setDimensions} />;
  }
}

interface ObjectWrapperProps {
  obj: Obj;
}

function ObjectWrapper({ obj }: ObjectWrapperProps) {
  const [dimensions, setDimensions] = useState<ObjDimensions>({ x: 0, y: 0, w: 0, h: 0 });
  const { currentObj, setCurrentObj, setDrag, currentTool } = useWhiteBoard((state) => ({
    currentObj: state.currentObj,
    setCurrentObj: state.setCurrentObj,
    setDrag: state.setDrag,
    currentTool: state.currentTool,
  }));
  const { mouse, camera } = useThree();
  return (
    <group
      onPointerDown={(e) => {
        e.stopPropagation();
        if (e.button === 0 && currentTool === 'SELECT') {
          setCurrentObj(obj.objId);
          const mousePos = getPos(mouse, camera);
          setDrag({ x: -(mousePos.x - obj.x), y: -(mousePos.y - obj.y) });
        }
      }}
    >
      <RenderWrapper obj={obj} setDimensions={setDimensions} />
      {currentObj === obj.objId ? <SelectionRenderer dimensions={dimensions} /> : <></>}
    </group>
  );
}
