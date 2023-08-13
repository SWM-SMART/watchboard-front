'use client';

import { Dispatch, SetStateAction, useEffect } from 'react';

interface Props {
  obj: RectObj;
  setDimensions: Dispatch<SetStateAction<ObjDimensions>>;
}

// renders given rectangle object, sets selection onClick
export default function RectangleRenderer({ obj, setDimensions }: Props) {
  useEffect(() => {
    setDimensions({ x: obj.x, y: obj.y, w: obj.w, h: obj.h });
  }, [obj, setDimensions]);
  return (
    <mesh position={[obj.x + obj.w / 2, obj.y + obj.h / 2, obj.depth]}>
      <planeGeometry attach={'geometry'} args={[obj.w, obj.h]} />
      <meshStandardMaterial color={obj.color} depthWrite={true} depthTest={true} />
    </mesh>
  );
}
