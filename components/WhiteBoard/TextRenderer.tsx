'use client';
import { Text } from '@react-three/drei';
import { MutableRefObject } from 'react';
import { useWhiteBoard } from '../../states/whiteboard';
import { useThree } from '@react-three/fiber';

interface TextViewProps {
  objId: string;
  dimensionsRef: MutableRefObject<ObjDimensions>;
}

export default function TextRenderer({ objId, dimensionsRef }: TextViewProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId))! as TextObj;
  const { invalidate } = useThree();

  dimensionsRef.current.w = obj.w;
  dimensionsRef.current.x = obj.x;
  dimensionsRef.current.y = obj.y;

  const position = calculatePosition(obj);

  return (
    <Text
      font={'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Regular.woff'}
      fontSize={obj.fontSize}
      maxWidth={obj.w}
      color={obj.color}
      overflowWrap={obj.overflow}
      lineHeight={1}
      position={[position.x, position.y, obj.depth]}
      textAlign={obj.textAlign}
      anchorX={obj.textAlign}
      anchorY={'bottom'}
      onAfterRender={(_renderer, _scene, _camera, geometry) => {
        if (geometry.boundingBox === null) return;
        const newHeight = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
        if (dimensionsRef.current.h !== newHeight) {
          dimensionsRef.current.h = newHeight;
          invalidate();
        }
      }}
    >
      {obj.text}
    </Text>
  );
}

function calculatePosition(obj: TextObj) {
  const position = { x: obj.x, y: obj.y };
  switch (obj.textAlign) {
    case 'center':
      return { ...position, x: obj.x + obj.w / 2 };
    case 'left':
      return position;
    case 'right':
      return { ...position, x: obj.x + obj.w };
  }
}
