'use client';
import { currentObjState, currentToolState, dragState } from '@/states/whiteboard';
import {
  SELECT_DEPTH,
  SELECT_HIGHLIGHT,
  SELECT_HIGHLIGHT_OPACITY,
  getPos,
} from '@/utils/whiteboardHelper';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

interface TextViewProps {
  obj: TextObj;
}

export default function TextRenderer({ obj }: TextViewProps) {
  const [selection, setSelection] = useRecoilState(currentObjState);
  const [_drag, setDrag] = useRecoilState(dragState);
  const tool = useRecoilValue(currentToolState);
  const { mouse, camera } = useThree();
  const textRef = useRef<any>(null);

  return (
    <group
      onPointerDown={(e) => {
        e.stopPropagation();
        if (tool === 'SELECT') {
          setSelection(obj.objId);
          const mousePos = getPos(mouse, camera);
          setDrag({ x: -(mousePos.x - obj.x), y: -(mousePos.y - obj.y) });
        }
      }}
    >
      <Text
        ref={textRef}
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        fontSize={obj.fontSize}
        maxWidth={obj.w}
        color={obj.color}
        overflowWrap={obj.overflow}
        lineHeight={1}
        position={[obj.x, obj.y, obj.depth]}
        anchorX={'center'}
        anchorY={'middle'}
      >
        {obj.text}
      </Text>
      {selection === obj.objId && textRef.current !== null ? (
        <mesh position={[obj.x, obj.y, SELECT_DEPTH]}>
          <planeGeometry
            attach={'geometry'}
            args={[
              obj.w,
              textRef.current.geometry.boundingBox.max.y -
                textRef.current.geometry.boundingBox.min.y,
            ]}
          />
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
