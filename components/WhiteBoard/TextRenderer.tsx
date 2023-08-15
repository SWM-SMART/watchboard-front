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
    setDimensions((state) => ({ ...state, x: obj.x, y: obj.y, w: obj.w, anchorX: obj.anchorX }));
  }, [obj.anchorX, obj.w, obj.x, obj.y, setDimensions]);

  useEffect(() => {
    setDimensions((state) => ({ ...state, h: height }));
  }, [height, setDimensions]);

  return (
    <Text
      font={'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Regular.woff'}
      fontSize={obj.fontSize}
      maxWidth={obj.w}
      color={obj.color}
      overflowWrap={obj.overflow}
      lineHeight={1}
      position={[obj.x, obj.y, obj.depth]}
      textAlign={obj.textAlign}
      anchorX={obj.anchorX}
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
