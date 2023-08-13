import { useWhiteBoard } from '@/states/whiteboard';
import {
  SELECT_DEPTH,
  SELECT_HIGHLIGHT,
  SELECT_HIGHLIGHT_OPACITY,
  FRAME_COLOR,
  FRAME_DEPTH,
  FRAME_WIDTH,
  getPos,
  FRAME_CORNER_DEPTH,
} from '@/utils/whiteboardHelper';
import { Circle, Line } from '@react-three/drei';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useState } from 'react';

interface SelectionRendererProps {
  dimensions: ObjDimensions;
  obj: Obj;
}

export default function SelectionRenderer({ dimensions, obj }: SelectionRendererProps) {
  const { setDrag, currentTool } = useWhiteBoard((state) => ({
    setDrag: state.setDrag,
    currentTool: state.currentTool,
  }));
  const { mouse, camera } = useThree();
  const pos = () => getPos(mouse, camera);

  if (dimensions.h <= 0) dimensions.h = 0;
  if (dimensions.w <= 0) dimensions.w = 0;

  // dragEvents are dispatched here and then handled in MouseHandler
  const pointerEventHandler = (e: ThreeEvent<PointerEvent>, mode: DragMode) => {
    // never stop propagation
    if (e.button === 0 && currentTool === 'SELECT') {
      const mousePos = pos();
      setDrag({
        mousePos: mousePos,
        mode: mode,
        prevObj: obj,
      });
    }
  };

  return (
    <>
      <mesh
        position={[dimensions.x + dimensions.w / 2, dimensions.y + dimensions.h / 2, SELECT_DEPTH]}
        onPointerDown={(e) => pointerEventHandler(e, 'move')}
      >
        <planeGeometry attach={'geometry'} args={[dimensions.w, dimensions.h]} />
        <meshStandardMaterial
          transparent={true}
          opacity={SELECT_HIGHLIGHT_OPACITY}
          color={SELECT_HIGHLIGHT}
          depthWrite={true}
          depthTest={true}
        />
      </mesh>
      <WireFrame onPointerDown={pointerEventHandler} dimensions={dimensions} />
      <Points obj={obj} onPointerDown={pointerEventHandler} dimensions={dimensions} />
    </>
  );
}

function WireFrame({
  dimensions,
  onPointerDown,
}: {
  dimensions: ObjDimensions;
  onPointerDown: (e: ThreeEvent<PointerEvent>, mode: DragMode) => void;
}) {
  return (
    <>
      {/* N */}
      <Line
        onPointerDown={(e) => onPointerDown(e, 'n')}
        points={[
          [dimensions.x, dimensions.y + dimensions.h, FRAME_DEPTH],
          [dimensions.x + dimensions.w, dimensions.y + dimensions.h, FRAME_DEPTH],
        ]}
        color={FRAME_COLOR}
        lineWidth={FRAME_WIDTH}
      />
      {/* E */}
      <Line
        onPointerDown={(e) => onPointerDown(e, 'e')}
        points={[
          [dimensions.x + dimensions.w, dimensions.y, FRAME_DEPTH],
          [dimensions.x + dimensions.w, dimensions.y + dimensions.h, FRAME_DEPTH],
        ]}
        color={FRAME_COLOR}
        lineWidth={FRAME_WIDTH}
      />
      {/* W */}
      <Line
        onPointerDown={(e) => onPointerDown(e, 'w')}
        points={[
          [dimensions.x, dimensions.y, FRAME_DEPTH],
          [dimensions.x, dimensions.y + dimensions.h, FRAME_DEPTH],
        ]}
        color={FRAME_COLOR}
        lineWidth={FRAME_WIDTH}
      />
      {/* S */}
      <Line
        onPointerDown={(e) => onPointerDown(e, 's')}
        points={[
          [dimensions.x, dimensions.y, FRAME_DEPTH],
          [dimensions.x + dimensions.w, dimensions.y, FRAME_DEPTH],
        ]}
        color={FRAME_COLOR}
        lineWidth={FRAME_WIDTH}
      />
    </>
  );
}

interface PointsProps {
  obj: Obj;
  dimensions: ObjDimensions;
  onPointerDown: (e: ThreeEvent<PointerEvent>, mode: DragMode) => void;
}

function Points({ obj, dimensions, onPointerDown }: PointsProps) {
  // TODO: add support for other object types
  switch (obj.type) {
    case 'RECT':
    case 'TEXT':
    case 'ROOT':
      return <ObjPoints dimensions={dimensions} onPointerDown={onPointerDown} />;
    case 'LINE':
      return <LinePoints obj={obj as LineObj} onPointerDown={onPointerDown} />;
  }
}

interface ObjPointsProps {
  dimensions: ObjDimensions;
  onPointerDown: (e: ThreeEvent<PointerEvent>, mode: DragMode) => void;
}

function ObjPoints({ dimensions, onPointerDown }: ObjPointsProps) {
  return (
    <>
      {/* NE */}
      <Point
        onPointerDown={(e) => onPointerDown(e, 'ne')}
        x={dimensions.x + dimensions.w}
        y={dimensions.y + dimensions.h}
      />
      {/* NW */}
      <Point
        onPointerDown={(e) => onPointerDown(e, 'nw')}
        x={dimensions.x}
        y={dimensions.y + dimensions.h}
      />
      {/* SE*/}
      <Point
        onPointerDown={(e) => onPointerDown(e, 'se')}
        x={dimensions.x + dimensions.w}
        y={dimensions.y}
      />
      {/* SW */}
      <Point onPointerDown={(e) => onPointerDown(e, 'sw')} x={dimensions.x} y={dimensions.y} />
    </>
  );
}

interface LinePointsProps {
  obj: LineObj;
  onPointerDown: (e: ThreeEvent<PointerEvent>, mode: DragMode) => void;
}

function LinePoints({ obj, onPointerDown }: LinePointsProps) {
  return (
    <>
      {/* NE */}
      <Point
        onPointerDown={(e) => {
          console.log('pointerdown');
          onPointerDown(e, 'ne');
        }}
        x={obj.x}
        y={obj.y}
      />
      {/* SW */}
      <Point onPointerDown={(e) => onPointerDown(e, 'sw')} x={obj.x2} y={obj.y2} />
    </>
  );
}

interface PointProps {
  x: number;
  y: number;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
}
function Point({ x, y, onPointerDown }: PointProps) {
  const [zoom, setZoom] = useState(0);
  // size attenuation false
  useFrame((s) => setZoom(s.camera.zoom));

  if (zoom === 0) return null;

  return (
    <Circle
      onPointerDown={(e) => onPointerDown(e)}
      position={[x, y, FRAME_CORNER_DEPTH]}
      args={[6 / zoom]}
    >
      <meshBasicMaterial color={FRAME_COLOR} />
    </Circle>
  );
}
