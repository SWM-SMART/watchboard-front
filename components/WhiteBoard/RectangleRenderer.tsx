'use client';

import { MutableRefObject } from 'react';
import { useWhiteBoard } from '../../states/whiteboard';

interface Props {
  objId: string;
  dimensionsRef: MutableRefObject<ObjDimensions>;
}

// renders given rectangle object, sets selection onClick
export default function RectangleRenderer({ objId, dimensionsRef }: Props) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId))! as RectObj;
  dimensionsRef.current.x = obj.x;
  dimensionsRef.current.y = obj.y;
  dimensionsRef.current.w = obj.w;
  dimensionsRef.current.h = obj.h;
  return (
    <mesh position={[obj.x + obj.w / 2, obj.y + obj.h / 2, obj.depth]}>
      <planeGeometry attach={'geometry'} args={[obj.w, obj.h]} />
      <meshStandardMaterial color={obj.color} depthWrite={true} depthTest={true} />
    </mesh>
  );
}
