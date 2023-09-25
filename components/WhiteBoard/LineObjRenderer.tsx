'use client';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Euler, Mesh } from 'three';
import { ObjRendererProps, RendererProps } from './NodeRenderer';
import { useWhiteBoard } from '@/states/whiteboard';
import { calculateLineGeometry } from '@/utils/whiteboardHelper';

export function LineRenderer({ objId, dimensionsRef, groupRef }: RendererProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId) as LineObj);
  useFrame(() => {
    if (groupRef === undefined || groupRef.current === null || obj === undefined) return;
    groupRef.current.position.setX(Math.min(obj.x, obj.x2));
    groupRef.current.position.setY(Math.min(obj.y, obj.y2));
    groupRef.current.position.setZ(obj.depth);
  });

  if (obj === undefined) return <></>;
  return <LineObjRenderer rawObj={obj} dimensionsRef={dimensionsRef} />;
}

export default function LineObjRenderer({ rawObj, dimensionsRef }: ObjRendererProps) {
  const obj = rawObj as LineObj;
  const baseX = Math.min(obj.x, obj.x2);
  const baseY = Math.min(obj.y, obj.y2);

  if (dimensionsRef !== undefined) {
    dimensionsRef.current.x = 0;
    dimensionsRef.current.y = 0;
    dimensionsRef.current.w = Math.abs(obj.x - obj.x2);
    dimensionsRef.current.h = Math.abs(obj.y - obj.y2);
  }

  return (
    <FlatLine
      x={obj.x - baseX}
      y={obj.y - baseY}
      x2={obj.x2 - baseX}
      y2={obj.y2 - baseY}
      strokeWidth={obj.strokeWidth}
      color={obj.color}
      depth={0}
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
  const { w, d } = useMemo(() => calculateLineGeometry(x, y, x2, y2), [x, x2, y, y2]);
  const meshRef = useRef<Mesh>(null!);
  useImperativeHandle(ref, () => ({
    setPoints: (x: number, y: number, x2: number, y2: number, strokeWidth: number) => {
      const { w, d } = calculateLineGeometry(x, y, x2, y2);
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
      <meshStandardMaterial color={color} depthWrite={true} depthTest={true} transparent={true} />
    </mesh>
  );
});
FlatLine.displayName = 'FlatLine';
