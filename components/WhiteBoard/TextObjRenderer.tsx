'use client';
import { Text } from '@react-three/drei';
import { invalidate, useFrame } from '@react-three/fiber';
import { ObjRendererProps, RendererProps } from './NodeRenderer';
import { useWhiteBoard } from '@/states/whiteboard';
import { DEFAULT_FONT } from '@/utils/whiteboardHelper';

export function TextRenderer({ objId, dimensionsRef, groupRef }: RendererProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId) as TextObj);
  useFrame(() => {
    const position = calculatePosition(obj);
    if (groupRef !== undefined && groupRef.current !== null) {
      groupRef.current.position.setX(position.x);
      groupRef.current.position.setY(position.y);
      groupRef.current.position.setZ(obj.depth);
    }
    if (dimensionsRef !== undefined) {
      dimensionsRef.current.w = obj.w;
      dimensionsRef.current.x = 0;
      dimensionsRef.current.y = 0;
    }
  });

  if (obj === undefined) return <></>;

  return <TextObjRenderer rawObj={obj} dimensionsRef={dimensionsRef} />;
}

export default function TextObjRenderer({ rawObj, dimensionsRef }: ObjRendererProps) {
  const obj = rawObj as TextObj;
  return (
    <Text
      font={DEFAULT_FONT}
      fontSize={obj.fontSize}
      maxWidth={obj.w}
      color={obj.color}
      overflowWrap={obj.overflow}
      lineHeight={1}
      position={[0, 0, 0]}
      textAlign={obj.textAlign}
      anchorX={obj.textAlign}
      anchorY={'bottom'}
      onAfterRender={(_renderer, _scene, _camera, geometry) => {
        if (geometry.boundingBox === null || dimensionsRef === undefined) return;
        const newHeight = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
        if (dimensionsRef.current.h != newHeight) {
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
