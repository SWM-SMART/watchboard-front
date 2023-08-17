'use client';
import { ThreeEvent } from '@react-three/fiber';
import { MutableRefObject, forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useWhiteBoard } from '../../states/whiteboard';
import { Euler, Mesh } from 'three';

interface LineRendererProps {
  objId: string;
  dimensionsRef: MutableRefObject<ObjDimensions>;
}
export default function LineRenderer({ objId, dimensionsRef }: LineRendererProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId))! as LineObj;

  dimensionsRef.current.x = Math.min(obj.x, obj.x2);
  dimensionsRef.current.y = Math.min(obj.y, obj.y2);
  dimensionsRef.current.w = Math.abs(obj.x - obj.x2);
  dimensionsRef.current.h = Math.abs(obj.y - obj.y2);

  return (
    <FlatLine
      x={obj.x}
      y={obj.y}
      x2={obj.x2}
      y2={obj.y2}
      strokeWidth={obj.strokeWidth}
      color={obj.color}
      depth={obj.depth}
    />
  );
}

interface FlatLineProps {
  x: number;
  y: number;
  x2: number;
  y2: number;
  strokeWidth: number;
  color: string;
  depth: number;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
}

export interface FlatLineRef {
  setPoints: (x: number, y: number, x2: number, y2: number, strokeWidth: number) => void;
}

export const FlatLine = forwardRef<FlatLineRef, FlatLineProps>((props, ref) => {
  const { x, y, x2, y2, strokeWidth, color, depth, onPointerDown } = props;
  const { w, d } = useMemo(() => calculate(x, y, x2, y2), [x, x2, y, y2]);
  const meshRef = useRef<Mesh>(null!);
  useImperativeHandle(ref, () => ({
    setPoints: (x: number, y: number, x2: number, y2: number, strokeWidth: number) => {
      const { w, d } = calculate(x, y, x2, y2);
      meshRef.current.position.set((x + x2) / 2, (y + y2) / 2, depth);
      meshRef.current.setRotationFromEuler(new Euler(0, 0, d));
      meshRef.current.scale.set(w, strokeWidth, 1);
    },
  }));

  return (
    <mesh
      ref={meshRef}
      position={[(x + x2) / 2, (y + y2) / 2, depth]}
      scale={[w, strokeWidth, 1]}
      rotation={[0, 0, d]}
      onPointerDown={onPointerDown}
    >
      <planeGeometry attach={'geometry'} args={[1, 1]} />
      <meshStandardMaterial color={color} depthWrite={true} depthTest={true} />
    </mesh>
  );
});
FlatLine.displayName = 'FlatLine';

function calculate(x: number, y: number, x2: number, y2: number) {
  const w = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
  const d = Math.atan2(y2 - y, x2 - x);
  return { w, d };
}
