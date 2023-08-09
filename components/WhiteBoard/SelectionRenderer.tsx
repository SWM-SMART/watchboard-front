import { useWhiteBoard } from '@/states/whiteboard';
import {
  SELECT_DEPTH,
  SELECT_HIGHLIGHT,
  SELECT_HIGHLIGHT_OPACITY,
  FRAME_COLOR,
  FRAME_DEPTH,
  FRAME_WIDTH,
  getPos,
} from '@/utils/whiteboardHelper';
import { Line } from '@react-three/drei';
import { ThreeEvent, useThree } from '@react-three/fiber';

interface SelectionRendererProps {
  dimensions: ObjDimensions;
}

export default function SelectionRenderer({ dimensions }: SelectionRendererProps) {
  const { setDrag, currentTool } = useWhiteBoard((state) => ({
    setDrag: state.setDrag,
    currentTool: state.currentTool,
  }));
  const { mouse, camera } = useThree();
  const pos = () => getPos(mouse, camera);

  if (dimensions.h <= 0 || dimensions.w <= 0) return null;

  // dragEvents are dispatched here and then handled in MouseHandler
  const pointerEventHandler = (e: ThreeEvent<PointerEvent>, mode: DragMode) => {
    // never stop propagation
    if (e.button === 0 && currentTool === 'SELECT') {
      const mousePos = pos();
      // 모드에 따라 필요한 값 저장
      const coord = (() => {
        switch (mode) {
          case 'move':
            return { x: -(mousePos.x - dimensions.x), y: -(mousePos.y - dimensions.y) };
          case 'n':
            return { x: 0, y: dimensions.y };
          case 'e':
            return { x: dimensions.x, y: 0 };
          case 'w':
            return { x: dimensions.x + dimensions.w, y: 0 };
          case 's':
            return { x: 0, y: dimensions.y + dimensions.h };
        }
      })();
      setDrag({
        x: coord.x,
        y: coord.y,
        mode: mode,
      });
    }
  };

  return (
    <>
      <mesh
        position={[dimensions.x + dimensions.w / 2, dimensions.y + dimensions.h / 2, SELECT_DEPTH]}
        onPointerDown={(e) => pointerEventHandler(e, 'move')}
      >
        <planeGeometry attach={'geometry'} args={[dimensions.w, dimensions.h]} />
        <meshStandardMaterial
          transparent={true}
          opacity={SELECT_HIGHLIGHT_OPACITY}
          color={SELECT_HIGHLIGHT}
          depthWrite={true}
          depthTest={true}
        />
      </mesh>
      <WireFrame onPointerDown={pointerEventHandler} dimensions={dimensions} />
    </>
  );
}

function WireFrame({
  dimensions,
  onPointerDown,
}: {
  dimensions: ObjDimensions;
  onPointerDown: (e: ThreeEvent<PointerEvent>, mode: DragMode) => void;
}) {
  return (
    <>
      {/* N */}
      <Line
        onPointerDown={(e) => onPointerDown(e, 'n')}
        points={[
          [dimensions.x, dimensions.y + dimensions.h, FRAME_DEPTH],
          [dimensions.x + dimensions.w, dimensions.y + dimensions.h, FRAME_DEPTH],
        ]}
        color={FRAME_COLOR}
        lineWidth={FRAME_WIDTH}
      />
      {/* E */}
      <Line
        onPointerDown={(e) => onPointerDown(e, 'e')}
        points={[
          [dimensions.x + dimensions.w, dimensions.y, FRAME_DEPTH],
          [dimensions.x + dimensions.w, dimensions.y + dimensions.h, FRAME_DEPTH],
        ]}
        color={FRAME_COLOR}
        lineWidth={FRAME_WIDTH}
      />
      {/* W */}
      <Line
        onPointerDown={(e) => onPointerDown(e, 'w')}
        points={[
          [dimensions.x, dimensions.y, FRAME_DEPTH],
          [dimensions.x, dimensions.y + dimensions.h, FRAME_DEPTH],
        ]}
        color={FRAME_COLOR}
        lineWidth={FRAME_WIDTH}
      />
      {/* S */}
      <Line
        onPointerDown={(e) => onPointerDown(e, 's')}
        points={[
          [dimensions.x, dimensions.y, FRAME_DEPTH],
          [dimensions.x + dimensions.w, dimensions.y, FRAME_DEPTH],
        ]}
        color={FRAME_COLOR}
        lineWidth={FRAME_WIDTH}
      />
    </>
  );
}
