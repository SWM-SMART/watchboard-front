'use client';
import { ObjRendererProps } from './NodeRenderer';

// renders given rectangle object, sets selection onClick
export default function RectangleObjRenderer({ rawObj, dimensionsRef }: ObjRendererProps) {
  const obj = rawObj as RectObj;

  if (dimensionsRef !== undefined) {
    dimensionsRef.current.x = obj.x;
    dimensionsRef.current.y = obj.y;
    dimensionsRef.current.w = obj.w;
    dimensionsRef.current.h = obj.h;
  }

  return (
    <mesh position={[obj.x + obj.w / 2, obj.y + obj.h / 2, obj.depth]}>
      <planeGeometry attach={'geometry'} args={[obj.w, obj.h]} />
      <meshStandardMaterial color={obj.color} depthWrite={true} depthTest={true} />
    </mesh>
  );
}
