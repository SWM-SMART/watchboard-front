'use client';
import { Circle } from '@react-three/drei';
import { ObjRendererProps } from './NodeRenderer';

export default function CircleObjRenderer({ rawObj, dimensionsRef }: ObjRendererProps) {
  const obj = rawObj as CircleObj;

  if (dimensionsRef !== undefined) {
    dimensionsRef.current.x = obj.x;
    dimensionsRef.current.y = obj.y;
    dimensionsRef.current.w = obj.r * 2;
    dimensionsRef.current.h = obj.r * 2;
  }

  return (
    <Circle position={[obj.x + obj.r, obj.y + obj.r, obj.depth]} args={[obj.r]}>
      <meshBasicMaterial color={obj.color} />
    </Circle>
  );
}
