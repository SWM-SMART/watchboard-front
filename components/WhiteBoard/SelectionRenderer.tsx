import { useWhiteBoard } from '@/states/whiteboard';
import {
  SELECT_DEPTH,
  SELECT_HIGHLIGHT,
  FRAME_COLOR,
  FRAME_DEPTH,
  FRAME_WIDTH,
  getPos,
  FRAME_CORNER_DEPTH,
} from '@/utils/whiteboardHelper';
import { Circle } from '@react-three/drei';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { MutableRefObject, forwardRef, useImperativeHandle, useRef } from 'react';
import { FlatLine, FlatLineRef } from './LineObjRenderer';
import { BufferGeometry, Mesh, NormalBufferAttributes } from 'three';

interface SelectionRendererProps {
  dimensionsRef: MutableRefObject<ObjDimensions>;
  objId: string;
}

export default function SelectionRenderer({ dimensionsRef, objId }: SelectionRendererProps) {
  const meshRef = useRef<Mesh>(null);
  const obj = useWhiteBoard((state) => state.objMap.get(objId))!;
  const { setDrag, currentTool } = useWhiteBoard((state) => ({
    setDrag: state.setDrag,
    currentTool: state.currentTool,
  }));
  const { mouse, camera } = useThree();
  const pos = () => getPos(mouse, camera);

  useFrame(() => {
    if (meshRef.current === null) return;
    const dimensions = dimensionsRef.current;
    meshRef.current.position.set(
      dimensions.x + dimensions.w / 2,
      dimensions.y + dimensions.h / 2,
      SELECT_DEPTH,
    );
    meshRef.current.scale.set(dimensions.w, dimensions.h, 1);
  });

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

  if (dimensionsRef.current.h <= 0) dimensionsRef.current.h = 0;
  if (dimensionsRef.current.w <= 0) dimensionsRef.current.w = 0;

  return (
    <>
      <mesh ref={meshRef} onPointerDown={(e) => pointerEventHandler(e, 'move')}>
        <planeGeometry attach={'geometry'} args={[1, 1]} />
        <meshStandardMaterial
          transparent={true}
          opacity={0.4}
          color={SELECT_HIGHLIGHT}
          depthWrite={true}
          depthTest={true}
        />
      </mesh>
      <WireFrame onPointerDown={pointerEventHandler} dimensionsRef={dimensionsRef} />
      <Points obj={obj} onPointerDown={pointerEventHandler} dimensionsRef={dimensionsRef} />
    </>
  );
}

function WireFrame({
  dimensionsRef,
  onPointerDown,
}: {
  dimensionsRef: MutableRefObject<ObjDimensions>;
  onPointerDown: (e: ThreeEvent<PointerEvent>, mode: DragMode) => void;
}) {
  const nRef = useRef<FlatLineRef>(null!);
  const eRef = useRef<FlatLineRef>(null!);
  const wRef = useRef<FlatLineRef>(null!);
  const sRef = useRef<FlatLineRef>(null!);

  const dimensions = dimensionsRef.current;

  useFrame((s) => {
    const strokeWidth = FRAME_WIDTH / s.camera.zoom;
    nRef.current.setPoints(
      dimensions.x,
      dimensions.y + dimensions.h,
      dimensions.x + dimensions.w,
      dimensions.y + dimensions.h,
      strokeWidth,
    );
    eRef.current.setPoints(
      dimensions.x + dimensions.w,
      dimensions.y,
      dimensions.x + dimensions.w,
      dimensions.y + dimensions.h,
      strokeWidth,
    );
    wRef.current.setPoints(
      dimensions.x,
      dimensions.y,
      dimensions.x,
      dimensions.y + dimensions.h,
      strokeWidth,
    );
    sRef.current.setPoints(
      dimensions.x,
      dimensions.y,
      dimensions.x + dimensions.w,
      dimensions.y,
      strokeWidth,
    );
  });

  return (
    <>
      {/* N */}
      <FlatLine
        ref={nRef}
        onPointerDown={(e) => onPointerDown(e, 'n')}
        x={dimensions.x}
        y={dimensions.y + dimensions.h}
        x2={dimensions.x + dimensions.w}
        y2={dimensions.y + dimensions.h}
        depth={FRAME_DEPTH}
        color={FRAME_COLOR}
        strokeWidth={FRAME_WIDTH}
      />
      {/* E */}
      <FlatLine
        ref={eRef}
        onPointerDown={(e) => onPointerDown(e, 'e')}
        x={dimensions.x + dimensions.w}
        y={dimensions.y}
        x2={dimensions.x + dimensions.w}
        y2={dimensions.y + dimensions.h}
        depth={FRAME_DEPTH}
        color={FRAME_COLOR}
        strokeWidth={FRAME_WIDTH}
      />
      {/* W */}
      <FlatLine
        ref={wRef}
        onPointerDown={(e) => onPointerDown(e, 'w')}
        x={dimensions.x}
        y={dimensions.y}
        x2={dimensions.x}
        y2={dimensions.y + dimensions.h}
        depth={FRAME_DEPTH}
        color={FRAME_COLOR}
        strokeWidth={FRAME_WIDTH}
      />
      {/* S */}
      <FlatLine
        ref={sRef}
        onPointerDown={(e) => onPointerDown(e, 's')}
        x={dimensions.x}
        y={dimensions.y}
        x2={dimensions.x + dimensions.w}
        y2={dimensions.y}
        depth={FRAME_DEPTH}
        color={FRAME_COLOR}
        strokeWidth={FRAME_WIDTH}
      />
    </>
  );
}

interface PointsProps {
  obj: Obj;
  dimensionsRef: MutableRefObject<ObjDimensions>;
  onPointerDown: (e: ThreeEvent<PointerEvent>, mode: DragMode) => void;
}

function Points({ obj, dimensionsRef, onPointerDown }: PointsProps) {
  // TODO: add support for other object types
  switch (obj.type) {
    case 'RECT':
    case 'TEXT':
    case 'ROOT':
      return <ObjPoints dimensionsRef={dimensionsRef} onPointerDown={onPointerDown} />;
    case 'LINE':
      return <LinePoints obj={obj as LineObj} onPointerDown={onPointerDown} />;
  }
}

interface ObjPointsProps {
  dimensionsRef: MutableRefObject<ObjDimensions>;
  onPointerDown: (e: ThreeEvent<PointerEvent>, mode: DragMode) => void;
}

function ObjPoints({ dimensionsRef, onPointerDown }: ObjPointsProps) {
  const dimensions = dimensionsRef.current;
  const neRef = useRef<PointRef>(null!);
  const nwRef = useRef<PointRef>(null!);
  const seRef = useRef<PointRef>(null!);
  const swRef = useRef<PointRef>(null!);

  useFrame(() => {
    neRef.current.setPoint(dimensions.x + dimensions.w, dimensions.y + dimensions.h);
    nwRef.current.setPoint(dimensions.x, dimensions.y + dimensions.h);
    seRef.current.setPoint(dimensions.x + dimensions.w, dimensions.y);
    swRef.current.setPoint(dimensions.x, dimensions.y);
  });

  return (
    <>
      {/* NE */}
      <Point
        ref={neRef}
        onPointerDown={(e) => onPointerDown(e, 'ne')}
        x={dimensions.x + dimensions.w}
        y={dimensions.y + dimensions.h}
      />
      {/* NW */}
      <Point
        ref={nwRef}
        onPointerDown={(e) => onPointerDown(e, 'nw')}
        x={dimensions.x}
        y={dimensions.y + dimensions.h}
      />
      {/* SE*/}
      <Point
        ref={seRef}
        onPointerDown={(e) => onPointerDown(e, 'se')}
        x={dimensions.x + dimensions.w}
        y={dimensions.y}
      />
      {/* SW */}
      <Point
        ref={swRef}
        onPointerDown={(e) => onPointerDown(e, 'sw')}
        x={dimensions.x}
        y={dimensions.y}
      />
    </>
  );
}

interface LinePointsProps {
  obj: LineObj;
  onPointerDown: (e: ThreeEvent<PointerEvent>, mode: DragMode) => void;
}

function LinePoints({ obj, onPointerDown }: LinePointsProps) {
  const baseX = Math.min(obj.x, obj.x2);
  const baseY = Math.min(obj.y, obj.y2);
  return (
    <>
      {/* NE */}
      <Point onPointerDown={(e) => onPointerDown(e, 'ne')} x={obj.x - baseX} y={obj.y - baseY} />
      {/* SW */}
      <Point onPointerDown={(e) => onPointerDown(e, 'sw')} x={obj.x2 - baseX} y={obj.y2 - baseY} />
    </>
  );
}

interface PointProps {
  x: number;
  y: number;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
}

interface PointRef {
  setPoint: (x: number, y: number) => void;
}

const Point = forwardRef<PointRef, PointProps>((props, ref) => {
  const { x, y, onPointerDown } = props;
  const circleRef = useRef<Mesh<BufferGeometry<NormalBufferAttributes>>>(null!);

  // size attenuation false
  useFrame((s) => {
    const scale = 6 / s.camera.zoom;
    circleRef.current.scale.set(scale, scale, 1);
  });

  useImperativeHandle(ref, () => ({
    setPoint: (x: number, y: number) => {
      circleRef.current.position.set(x, y, FRAME_CORNER_DEPTH);
    },
  }));

  return (
    <Circle
      ref={circleRef}
      onPointerDown={(e) => onPointerDown(e)}
      position={[x, y, FRAME_CORNER_DEPTH]}
      args={[1]}
    >
      <meshBasicMaterial color={FRAME_COLOR} />
    </Circle>
  );
});
Point.displayName = 'Point';
