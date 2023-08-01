'use client';
import { currentObjState, currentToolState, dragState } from '@/states/whiteboard';
import { getPos } from '@/utils/whiteboardHelper';
import { useThree } from '@react-three/fiber';
import { useRecoilState, useRecoilValue } from 'recoil';

interface Props {
  obj: RectObj;
}

// renders given rectangle object, sets selection onClick
export default function RectangleRenderer({ obj }: Props) {
  const [_selection, setSelection] = useRecoilState(currentObjState);
  const [_drag, setDrag] = useRecoilState(dragState);
  const tool = useRecoilValue(currentToolState);
  const { mouse, camera } = useThree();
  return (
    <mesh
      position={[obj.x, obj.y, obj.depth]}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (tool === 'SELECT') {
          setSelection(obj.objId);
          const mousePos = getPos(mouse, camera);
          setDrag({ x: -(mousePos.x - obj.x), y: -(mousePos.y - obj.y) });
        }
      }}
    >
      <planeGeometry attach={'geometry'} args={[obj.w, obj.h]} />
      <meshStandardMaterial color={obj.color} depthWrite={true} depthTest={true} />
    </mesh>
  );
}
