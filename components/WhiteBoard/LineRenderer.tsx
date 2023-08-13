'use client';
import { Line } from '@react-three/drei';
import { Dispatch, SetStateAction, useEffect } from 'react';

interface LineRendererProps {
  obj: LineObj;
  setDimensions: Dispatch<SetStateAction<ObjDimensions>>;
}
export default function LineRenderer({ obj, setDimensions }: LineRendererProps) {
  useEffect(() => {
    setDimensions({
      x: Math.min(obj.x, obj.x2),
      y: Math.min(obj.y, obj.y2),
      w: Math.abs(obj.x - obj.x2),
      h: Math.abs(obj.y - obj.y2),
    });
  }, [obj, setDimensions]);
  return (
    <Line
      points={[
        [obj.x, obj.y, obj.depth],
        [obj.x2, obj.y2, obj.depth],
      ]}
      color={obj.color}
      lineWidth={obj.strokeWidth}
      worldUnits={true}
      dashed={false}
    />
  );
}
