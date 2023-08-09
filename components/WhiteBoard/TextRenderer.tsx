'use client';
import { Text } from '@react-three/drei';
import { Dispatch, SetStateAction } from 'react';

interface TextViewProps {
  obj: TextObj;
  setDimensions: Dispatch<SetStateAction<ObjDimensions>>;
}

export default function TextRenderer({ obj, setDimensions }: TextViewProps) {
  return (
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
        setDimensions({
          x: obj.x,
          y: obj.y,
          w: Math.max(geometry.boundingBox.max.x - geometry.boundingBox.min.x, obj.w),
          h: geometry.boundingBox.max.y - geometry.boundingBox.min.y,
        });
      }}
    >
      {obj.text}
    </Text>
  );
}
