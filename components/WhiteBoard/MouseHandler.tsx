'use client';
import { objMapState, currentObjState, objTreeState, currentToolState } from '@/states/whiteboard';
import { Camera, useFrame, useThree } from '@react-three/fiber';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { boundNumber, createRect, getPos } from '@/utils/whiteboardHelper';
import { Clock, Vector2 } from 'three';

const MAX_OPACITY = 0.5;
const WHEEL_DELTA_FACTOR = 100;
const WHEEL_MAX_DELTA = 20;
const PAN_MAX_DELTA = 100;
const MAX_ZOOM = 10000;
const MIN_ZOOM = 0.1;

export default function MouseHandler() {
  const {
    invalidate,
    mouse,
    camera,
    clock,
    gl: { domElement },
  } = useThree(); // More like reference? Not a state, useEffect can't track these

  const tool = useRecoilValue(currentToolState);

  const {
    opacity,
    setOpacity,
    cameraPan,
    setCameraPan,
    selection,
    setSelection,
    drawRect,
    setDrawRect,
  } = useToolFlags(tool);

  const { upPos, setUpPos, upTime, setUpTime } = usePointerUp(
    mouse,
    camera,
    tool,
    domElement,
    clock,
    setSelection,
    setCameraPan,
    setDrawRect,
  );

  const { downPos } = usePointerDown(
    mouse,
    camera,
    tool,
    domElement,
    setSelection,
    setCameraPan,
    setDrawRect,
    setOpacity,
    setUpPos,
    setUpTime,
  );

  useWheel(invalidate, domElement, camera);

  usePointerMove(mouse, camera, domElement, cameraPan, selection, opacity, invalidate, setUpPos);

  useDrawRect(upPos, downPos, drawRect, setDrawRect);

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

const usePointerUp = (
  mouse: Vector2,
  camera: Camera,
  tool: Tool,
  domElement: HTMLCanvasElement,
  clock: Clock,
  setSelection: Dispatch<SetStateAction<boolean>>,
  setCameraPan: Dispatch<SetStateAction<boolean>>,
  setDrawRect: Dispatch<SetStateAction<boolean>>,
) => {
  const [upPos, setUpPos] = useState<Coord>({ x: 0, y: 0 }); // mouse down position
  const [upTime, setUpTime] = useState<number>(0);

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
  }, [camera, clock.elapsedTime, domElement, mouse, setCameraPan, setDrawRect, setSelection, tool]);

  return { upPos, setUpPos, upTime, setUpTime };
};

const usePointerDown = (
  mouse: Vector2,
  camera: Camera,
  tool: Tool,
  domElement: HTMLCanvasElement,
  setSelection: Dispatch<SetStateAction<boolean>>,
  setCameraPan: Dispatch<SetStateAction<boolean>>,
  setDrawRect: Dispatch<SetStateAction<boolean>>,
  setOpacity: Dispatch<SetStateAction<number>>,
  setUpPos: Dispatch<SetStateAction<Coord>>,
  setUpTime: Dispatch<SetStateAction<number>>,
) => {
  const [downPos, setDownPos] = useState<Coord>({ x: 0, y: 0 }); // mouse down position
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
          e.stopPropagation(); // fall through
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
  }, [
    camera,
    domElement,
    mouse,
    setCameraPan,
    setDrawRect,
    setOpacity,
    setSelection,
    setUpPos,
    setUpTime,
    tool,
  ]);

  return { downPos };
};

const usePointerMove = (
  mouse: Vector2,
  camera: Camera,
  domElement: HTMLCanvasElement,
  cameraPan: boolean,
  selection: boolean,
  opacity: number,
  invalidate: () => void,
  setUpPos: Dispatch<SetStateAction<Coord>>,
) => {
  useEffect(() => {
    const pointerMove = () => {
      if (cameraPan) {
        invalidate();
      }
      if (selection) {
        if (opacity === MAX_OPACITY) setUpPos(getPos(mouse, camera));
        invalidate();
      }
    };
    domElement.addEventListener('pointermove', pointerMove);
    return () => {
      domElement.removeEventListener('pointermove', pointerMove);
    };
  }, [camera, cameraPan, domElement, invalidate, mouse, opacity, selection, setUpPos]);
};

const useWheel = (invalidate: () => void, domElement: HTMLCanvasElement, camera: Camera) => {
  // wheel
  useEffect(() => {
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      // pinch zoom
      if (e.ctrlKey) {
        const boundDelta = boundNumber(e.deltaY, -WHEEL_MAX_DELTA, WHEEL_MAX_DELTA);
        const newZoom = camera.zoom - (boundDelta * camera.zoom) / WHEEL_DELTA_FACTOR;
        if (newZoom < MIN_ZOOM) camera.zoom = MIN_ZOOM;
        else if (newZoom > MAX_ZOOM) camera.zoom = MAX_ZOOM;
        else camera.zoom = newZoom;
        camera.updateProjectionMatrix();
      } else {
        // scroll pan
        camera.position.setX(
          camera.position.x + boundNumber(e.deltaX, -PAN_MAX_DELTA, PAN_MAX_DELTA) / camera.zoom,
        );
        camera.position.setY(
          camera.position.y - boundNumber(e.deltaY, -PAN_MAX_DELTA, PAN_MAX_DELTA) / camera.zoom,
        );
      }
      invalidate();
    };
    domElement.addEventListener('wheel', wheel);
    return () => domElement.removeEventListener('wheel', wheel);
  }, [domElement, invalidate, camera]);
};

const useDrawRect = (
  upPos: Coord,
  downPos: Coord,
  drawRect: boolean,
  setDrawRect: Dispatch<SetStateAction<boolean>>,
) => {
  const [_objMap, setObjMap] = useRecoilState(objMapState);
  const [_objTree, setObjTree] = useRecoilState(objTreeState);
  const [_current, setCurrent] = useRecoilState(currentObjState);

  useEffect(() => {
    if (drawRect) {
      const appendRect = (obj: RectObj) => {
        const newMap = new Map<string, Obj>();
        newMap.set(obj.objId, obj);
        setObjMap((previousMap) => {
          return new Map<string, Obj>([...previousMap, ...newMap]);
        });
        setObjTree((previousTree) => {
          return {
            ...previousTree,
            childNodes: [...previousTree.childNodes, { objId: obj.objId, childNodes: [] }],
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
  }, [downPos, drawRect, setCurrent, setDrawRect, setObjMap, setObjTree, upPos]);
};

const useToolFlags = (tool: string) => {
  const [opacity, setOpacity] = useState<number>(0);
  const [cameraPan, setCameraPan] = useState<boolean>(false);
  const [selection, setSelection] = useState<boolean>(false);
  const [drawRect, setDrawRect] = useState<boolean>(false);

  useEffect(() => {
    setSelection(false);
    setCameraPan(false);
    setDrawRect(false);
  }, [tool]);

  return {
    opacity,
    setOpacity,
    cameraPan,
    setCameraPan,
    selection,
    setSelection,
    drawRect,
    setDrawRect,
  };
};
