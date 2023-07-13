import { objMapState, objState, objTreeState, toolState } from '@/states/whiteboard';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { createRect, genDepth, genId, getPos } from '@/utils/whiteboardHelper';

const MAX_OPACITY = 0.5;

export default function MouseHandler() {
  const {
    invalidate,
    mouse,
    camera,
    clock,
    gl: { domElement },
  } = useThree(); // More like reference? Not a state, useEffect can't track these

  const tool = useRecoilValue(toolState);

  const [upPos, setUpPos] = useState<Coord>(() => getPos(mouse, camera));
  const [opacity, setOpacity] = useState<number>(0);
  const [upTime, setUpTime] = useState<number>(0);
  const [cameraPan, setCameraPan] = useState<boolean>(false);
  const [selection, setSelection] = useState<boolean>(false);
  const [drawRect, setDrawRect] = useState<boolean>(false);
  const [downPos, setDownPos] = useState<Coord>({ x: 0, y: 0 }); // mouse down position
  const [zoom, setZoom] = useState<number>(1);
  const [objMap, setObjMap] = useRecoilState(objMapState);
  const [objTree, setObjTree] = useRecoilState(objTreeState);
  const [current, setCurrent] = useRecoilState(objState);

  useEffect(() => {
    setSelection(false);
    setCameraPan(false);
    setDrawRect(false);
  }, [tool]);

  // pointer move listener
  useEffect(() => {
    const pointerMove = () => {
      if (cameraPan) invalidate();
      if (selection) {
        if (opacity === MAX_OPACITY) setUpPos(getPos(mouse, camera));
        invalidate();
      }
    };
    domElement.addEventListener('pointermove', pointerMove);
    return () => {
      domElement.removeEventListener('pointermove', pointerMove);
    };
  }, [camera, cameraPan, domElement, invalidate, mouse, opacity, selection]);

  // pointer down listener
  useEffect(() => {
    const pointerDown = (e: PointerEvent) => {
      const newPos = getPos(mouse, camera);

      // middle click : always pan
      if (e.button === 1) {
        setSelection(false);
        setCameraPan(true);
        setDownPos(newPos);
        return;
      }

      switch (tool) {
        case 'HAND': // pan on left click
          e.stopPropagation(); // prevent object selection on click
          if (e.button === 0) {
            setDownPos(newPos);
            setCameraPan(true);
            setDownPos(newPos);
          }
          break;
        case 'RECT':
          setDrawRect(false);
          e.stopPropagation();
        case 'SELECT': // selection box on left click
          if (e.button === 0) {
            setSelection(true);
            setOpacity(MAX_OPACITY);
            setUpPos(newPos);
            setDownPos(newPos);
            setUpTime(0);
          }
          break;
        case 'TEXT':
          e.stopPropagation();
          break;
      }
    };

    domElement.addEventListener('pointerdown', pointerDown);
    return () => {
      domElement.removeEventListener('pointerdown', pointerDown);
    };
  }, [camera, domElement, mouse, tool]);

  // pointer up
  useEffect(() => {
    const pointerUp = (e: PointerEvent) => {
      const newPos = getPos(mouse, camera);

      if (e.button === 1) {
        setCameraPan(false);
        setUpPos(newPos);
        return;
      }

      switch (tool) {
        case 'HAND':
          if (e.button === 0) {
            setCameraPan(false);
            setUpPos(newPos);
          }
          break;
        case 'RECT':
          if (e.button == 0) {
            setUpPos(newPos);
            setUpTime(0);
            setSelection(false);
            setDrawRect(true);
          }
          break;
        case 'SELECT':
          if (e.button == 0) {
            setUpPos(newPos);
            setUpTime(clock.elapsedTime);
          }
          break;
        case 'TEXT':
          break;
      }
    };

    domElement.addEventListener('pointerup', pointerUp);

    return () => domElement.removeEventListener('pointerup', pointerUp);
  }, [camera, clock.elapsedTime, domElement, mouse, tool]);

  // wheel
  useEffect(() => {
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => {
        const newZ = z - e.deltaY / 1200;
        if (newZ < 0.1) return z;
        return newZ;
      });
      invalidate();
    };
    domElement.addEventListener('wheel', wheel);
    return () => domElement.removeEventListener('wheel', wheel);
  }, [domElement, invalidate]);

  useEffect(() => {
    if (drawRect) {
      const appendRect = (obj: RectObj) => {
        const map = new Map<string, Obj>();
        map.set(obj.objId, obj);
        setObjMap((m) => {
          return new Map<string, Obj>([...m, ...map]);
        });
        setObjTree((t) => {
          return {
            ...t,
            childNodes: [...t.childNodes, { objId: obj.objId, childNodes: [] }],
          };
        });
      };
      // create and append rect
      const obj = createRect(
        (upPos.x + downPos.x) / 2,
        (upPos.y + downPos.y) / 2,
        Math.abs(upPos.x - downPos.x),
        Math.abs(upPos.y - downPos.y),
      );
      appendRect(obj);
      setCurrent(obj.objId);
      setDrawRect(false);
    }
  }, [downPos, drawRect, selection, setCurrent, setObjMap, setObjTree, tool, upPos]);

  useFrame((s) => {
    // update opacity (if selection is active)
    if (upTime > 0 && selection) {
      const newO = MAX_OPACITY - (s.clock.elapsedTime - upTime);
      if (newO < 0) setSelection(false);
      else setOpacity(newO);
    }

    // update camera position (if pan is active)
    if (cameraPan) {
      const newPos = getPos(s.mouse, s.camera);
      s.camera.position.setX(downPos.x - (newPos.x - s.camera.position.x));
      s.camera.position.setY(downPos.y - (newPos.y - s.camera.position.y));
    }

    // update camera zoom (if zoom value has changed)
    if (zoom != s.camera.zoom) {
      // TODO: make mouse stay on the same position during zoom
      s.camera.zoom = zoom;
      s.camera.updateProjectionMatrix();
    }
  });

  // mouse interaction feedback: draw rectangle in selected area (if selection is active)
  return selection ? (
    <mesh
      position={[(upPos.x + downPos.x) / 2, (upPos.y + downPos.y) / 2, 1]}
      scale={1}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <planeGeometry
        attach={'geometry'}
        args={[Math.abs(upPos.x - downPos.x), Math.abs(upPos.y - downPos.y)]}
      />
      <meshStandardMaterial
        transparent={true}
        opacity={opacity}
        color={'rgb(220,220,255)'}
        depthWrite={true}
        depthTest={true}
      />
    </mesh>
  ) : (
    <></>
  );
}
