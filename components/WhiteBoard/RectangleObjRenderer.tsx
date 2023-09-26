'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import { ObjRendererProps, RendererProps } from './NodeRenderer';
import { useFrame } from '@react-three/fiber';

export function RectangleRenderer({ objId, dimensionsRef, groupRef }: RendererProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId));
  useFrame(() => {
    if (groupRef === undefined || groupRef.current === null || obj === undefined) return;
    groupRef.current.position.setX(obj.x);
    groupRef.current.position.setY(obj.y);
    groupRef.current.position.setZ(obj.depth); // gap between nodes
  });
  if (obj === undefined) return <></>;
  return <RectangleObjRenderer rawObj={obj} dimensionsRef={dimensionsRef} />;
}

// renders given rectangle object, sets selection onClick
export default function RectangleObjRenderer({ rawObj, dimensionsRef }: ObjRendererProps) {
  const obj = rawObj as RectObj;

  if (dimensionsRef !== undefined) {
    dimensionsRef.current.x = 0;
    dimensionsRef.current.y = 0;
    dimensionsRef.current.w = obj.w;
    dimensionsRef.current.h = obj.h;
  }

  return (
    <mesh position={[obj.w / 2, obj.h / 2, 0]}>
      <planeGeometry attach={'geometry'} args={[obj.w, obj.h]} />
      <meshStandardMaterial
        color={obj.color}
        depthWrite={true}
        transparent={true}
        depthTest={true}
      />
    </mesh>
  );
}
