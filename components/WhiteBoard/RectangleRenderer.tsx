'use client';
import { currentObjState } from '@/states/whiteboard';
import { useRecoilState } from 'recoil';

interface Props {
  obj: RectObj;
}

// renders given rectangle object, sets selection onClick
export default function RectangleRenderer({ obj }: Props) {
  const [selection, setSelection] = useRecoilState(currentObjState);
  return (
    <mesh
      position={[obj.x, obj.y, obj.depth]}
      scale={1}
      onClick={(e) => {
        e.stopPropagation();
        setSelection(obj.objId);
      }}
    >
      <planeGeometry attach={'geometry'} args={[obj.w, obj.h]} />
      <meshStandardMaterial color={obj.color} depthWrite={true} depthTest={true} />
    </mesh>
  );
}
