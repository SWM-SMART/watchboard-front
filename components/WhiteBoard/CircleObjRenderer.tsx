'use client';
import { Circle } from '@react-three/drei';
import { ObjRendererProps, RendererProps } from './NodeRenderer';
import { useWhiteBoard } from '@/states/whiteboard';
import { useFrame } from '@react-three/fiber';

export function CircleRenderer({ objId, dimensionsRef, groupRef }: RendererProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId) as CircleObj);
  useFrame(() => {
    if (groupRef === undefined || groupRef.current === null || obj === undefined) return;
    groupRef.current.position.setX(obj.x + obj.r);
    groupRef.current.position.setY(obj.y + obj.r);
    groupRef.current.position.setZ(obj.depth);
  });
  if (obj === undefined) return <></>;
  return <CircleObjRenderer rawObj={obj} dimensionsRef={dimensionsRef} />;
}

export default function CircleObjRenderer({ rawObj, dimensionsRef }: ObjRendererProps) {
  const obj = rawObj as CircleObj;

  if (dimensionsRef !== undefined) {
    dimensionsRef.current.x = -obj.r;
    dimensionsRef.current.y = -obj.r;
    dimensionsRef.current.w = obj.r * 2;
    dimensionsRef.current.h = obj.r * 2;
  }

  return (
    <Circle position={[0, 0, 0]} args={[obj.r]}>
      <meshBasicMaterial color={obj.color} transparent={true} />
    </Circle>
  );
}
