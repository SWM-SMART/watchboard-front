'use client';
import { Text } from '@react-three/drei';

interface TextViewProps {
  obj: TextObj;
}

export default function TextRenderer({ obj }: TextViewProps) {
  return (
    <Text
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
  );
}
