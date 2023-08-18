'use client';
import { MutableRefObject } from 'react';
import { useWhiteBoard } from '../../states/whiteboard';
import { Circle } from '@react-three/drei';

interface CircleRendererProps {
  objId: string;
  dimensionsRef: MutableRefObject<ObjDimensions>;
}
export default function CircleRenderer({ objId, dimensionsRef }: CircleRendererProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId))! as CircleObj;

  dimensionsRef.current.x = obj.x;
  dimensionsRef.current.y = obj.y;
  dimensionsRef.current.w = obj.r * 2;
  dimensionsRef.current.h = obj.r * 2;

  return (
    <Circle position={[obj.x + obj.r, obj.y + obj.r, obj.depth]} args={[obj.r]}>
      <meshBasicMaterial color={obj.color} />
    </Circle>
  );
}
