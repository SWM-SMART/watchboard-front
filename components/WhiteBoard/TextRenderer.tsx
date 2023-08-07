'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import {
  SELECT_DEPTH,
  SELECT_HIGHLIGHT,
  SELECT_HIGHLIGHT_OPACITY,
  getPos,
} from '@/utils/whiteboardHelper';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useState } from 'react';

interface TextViewProps {
  obj: TextObj;
}

export default function TextRenderer({ obj }: TextViewProps) {
  const { currentObj, setCurrentObj, setDrag, currentTool } = useWhiteBoard((state) => ({
    currentObj: state.currentObj,
    setCurrentObj: state.setCurrentObj,
    setDrag: state.setDrag,
    currentTool: state.currentTool,
  }));
  const { mouse, camera } = useThree();
  const [size, setSize] = useState<Coord>({ x: 0, y: 0 });

  return (
    <group
      onPointerDown={(e) => {
        e.stopPropagation();
        if (currentTool === 'SELECT') {
          setCurrentObj(obj.objId);
          const mousePos = getPos(mouse, camera);
          setDrag({ x: -(mousePos.x - obj.x), y: -(mousePos.y - obj.y) });
        }
      }}
    >
      <Text
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        fontSize={obj.fontSize}
        maxWidth={obj.w}
        color={obj.color}
        overflowWrap={obj.overflow}
        lineHeight={1}
        position={[obj.x, obj.y, obj.depth]}
        anchorX={'left'}
        anchorY={'bottom'}
        onAfterRender={(_renderer, _scene, _camera, geometry) => {
          if (geometry.boundingBox === null) return;
          setSize({
            x: geometry.boundingBox.max.x - geometry.boundingBox.min.x,
            y: geometry.boundingBox.max.y - geometry.boundingBox.min.y,
          });
        }}
      >
        {obj.text}
      </Text>
      {currentObj === obj.objId && size.y > 0 ? (
        <mesh position={[obj.x + obj.w / 2, obj.y + size.y / 2, SELECT_DEPTH]}>
          <planeGeometry attach={'geometry'} args={[obj.w, size.y]} />
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
