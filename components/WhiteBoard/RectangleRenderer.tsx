'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import {
  SELECT_DEPTH,
  SELECT_HIGHLIGHT,
  SELECT_HIGHLIGHT_OPACITY,
  getPos,
} from '@/utils/whiteboardHelper';
import { useThree } from '@react-three/fiber';

interface Props {
  obj: RectObj;
}

// renders given rectangle object, sets selection onClick
export default function RectangleRenderer({ obj }: Props) {
  const { currentObj, setCurrentObj, setDrag, currentTool } = useWhiteBoard((state) => ({
    currentObj: state.currentObj,
    setCurrentObj: state.setCurrentObj,
    setDrag: state.setDrag,
    currentTool: state.currentTool,
  }));
  const { mouse, camera } = useThree();
  return (
    <group
      onPointerDown={(e) => {
        e.stopPropagation();
        if (e.button === 0 && currentTool === 'SELECT') {
          setCurrentObj(obj.objId);
          const mousePos = getPos(mouse, camera);
          setDrag({ x: -(mousePos.x - obj.x), y: -(mousePos.y - obj.y) });
        }
      }}
    >
      <mesh position={[obj.x + obj.w / 2, obj.y + obj.h / 2, obj.depth]}>
        <planeGeometry attach={'geometry'} args={[obj.w, obj.h]} />
        <meshStandardMaterial color={obj.color} depthWrite={true} depthTest={true} />
      </mesh>
      {currentObj === obj.objId ? (
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
