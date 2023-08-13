'use client';
import { ThreeEvent } from '@react-three/fiber';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';

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
    <FlatLine
      x={obj.x}
      y={obj.y}
      x2={obj.x2}
      y2={obj.y2}
      strokeWidth={obj.strokeWidth}
      color={obj.color}
      depth={obj.depth}
    />
  );
}

interface FlatLineProps {
  x: number;
  y: number;
  x2: number;
  y2: number;
  strokeWidth: number;
  color: string;
  depth: number;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
}

export function FlatLine({
  x,
  y,
  x2,
  y2,
  strokeWidth,
  color,
  depth,
  onPointerDown,
}: FlatLineProps) {
  const { w, d } = useMemo(() => calculate(x, y, x2, y2), [x - x2, y - y2]);
  return (
    <mesh
      position={[(x + x2) / 2, (y + y2) / 2, depth]}
      rotation={[0, 0, d]}
      onPointerDown={onPointerDown}
    >
      <planeGeometry attach={'geometry'} args={[w, strokeWidth]} />
      <meshStandardMaterial color={color} depthWrite={true} depthTest={true} />
    </mesh>
  );
}

function calculate(x: number, y: number, x2: number, y2: number) {
  const w = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
  const d = Math.atan2(y2 - y, x2 - x);
  return { w, d };
}
