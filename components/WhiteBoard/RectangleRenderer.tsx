'use client';
import { currentObjState, currentToolState, dragState } from '@/states/whiteboard';
import {
  SELECT_DEPTH,
  SELECT_HIGHLIGHT,
  SELECT_HIGHLIGHT_OPACITY,
  getPos,
} from '@/utils/whiteboardHelper';
import { useThree } from '@react-three/fiber';
import { useRecoilState, useRecoilValue } from 'recoil';

interface Props {
  obj: RectObj;
}

// renders given rectangle object, sets selection onClick
export default function RectangleRenderer({ obj }: Props) {
  const [selection, setSelection] = useRecoilState(currentObjState);
  const [_drag, setDrag] = useRecoilState(dragState);
  const tool = useRecoilValue(currentToolState);
  const { mouse, camera } = useThree();
  return (
    <group
      onPointerDown={(e) => {
        e.stopPropagation();
        if (e.button === 0 && tool === 'SELECT') {
          setSelection(obj.objId);
          const mousePos = getPos(mouse, camera);
          setDrag({ x: -(mousePos.x - obj.x), y: -(mousePos.y - obj.y) });
        }
      }}
    >
      <mesh position={[obj.x + obj.w / 2, obj.y + obj.h / 2, obj.depth]}>
        <planeGeometry attach={'geometry'} args={[obj.w, obj.h]} />
        <meshStandardMaterial color={obj.color} depthWrite={true} depthTest={true} />
      </mesh>
      {selection === obj.objId ? (
        <mesh position={[obj.x + obj.w / 2, obj.y + obj.h / 2, SELECT_DEPTH]}>
          <planeGeometry attach={'geometry'} args={[obj.w, obj.h]} />
          <meshStandardMaterial
            transparent={true}
            opacity={SELECT_HIGHLIGHT_OPACITY}
            color={SELECT_HIGHLIGHT}
            depthWrite={true}
            depthTest={true}
          />
        </mesh>
      ) : (
        <></>
      )}
    </group>
  );
}
