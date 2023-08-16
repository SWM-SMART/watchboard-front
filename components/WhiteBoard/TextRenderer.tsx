'use client';
import { Text } from '@react-three/drei';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface TextViewProps {
  obj: TextObj;
  setDimensions: Dispatch<SetStateAction<ObjDimensions>>;
}

export default function TextRenderer({ obj, setDimensions }: TextViewProps) {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    setDimensions((state) => ({ ...state, x: obj.x, y: obj.y, w: obj.w }));
  }, [obj.w, obj.x, obj.y, setDimensions]);

  useEffect(() => {
    setDimensions((state) => ({ ...state, h: height }));
  }, [height, setDimensions]);

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
        setHeight(geometry.boundingBox.max.y - geometry.boundingBox.min.y);
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
