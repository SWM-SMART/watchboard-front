'use client';
import { Camera, useFrame, useThree } from '@react-three/fiber';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  SELECT_DEPTH,
  SELECT_HIGHLIGHT,
  boundNumber,
  createRect,
  createText,
  getPos,
  validateValue,
} from '@/utils/whiteboardHelper';
import { Clock, Vector2 } from 'three';
import { useWhiteBoard } from '@/states/whiteboard';

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

  const { currentTool, objMap, addObj, updateObj, currentObj, setCurrentObj, drag, setDrag } =
    useWhiteBoard((state) => ({
      currentTool: state.currentTool,
      objMap: state.objMap,
      addObj: state.addObj,
      updateObj: state.updateObj,
      currentObj: state.currentObj,
      setCurrentObj: state.setCurrentObj,
      drag: state.drag,
      setDrag: state.setDrag,
    }));

  const {
    opacity,
    setOpacity,
    cameraPan,
    setCameraPan,
    selection,
    setSelection,
    drawRect,
    setDrawRect,
  } = useToolFlags(currentTool);

  const { upPos, setUpPos, upTime, setUpTime } = usePointerUp(
    mouse,
    camera,
    currentTool,
    domElement,
    clock,
    setSelection,
    setCameraPan,
    setDrawRect,
    setDrag,
  );

  const { downPos } = usePointerDown(
    mouse,
    camera,
    currentTool,
    domElement,
    setSelection,
    setCameraPan,
    setDrawRect,
    setOpacity,
    setUpPos,
    setUpTime,
    setCurrentObj,
  );

  useWheel(invalidate, domElement, camera);

  usePointerMove(
    mouse,
    camera,
    domElement,
    cameraPan,
    selection,
    opacity,
    drag,
    invalidate,
    setUpPos,
  );

  useDrawRect(currentTool, upPos, downPos, drawRect, setDrawRect, addObj);

  useFrame((s) => {
    // update opacity (if selection is active)
    if (drag !== null) {
      setSelection(false);
    } else if (upTime > 0 && selection) {
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

    // drag object
    if (drag !== null && currentObj !== null) {
      const obj = objMap.get(currentObj);
      if (obj === undefined) return;
      const newPos = getPos(s.mouse, s.camera);
      handleDrag(obj, newPos, drag, updateObj);
    }
  });

  // validation
  const validate = currentTool === 'RECT' || currentTool === 'TEXT';
  const validUpPos: Coord = {
    x: validate ? validateValue(upPos.x) : upPos.x,
    y: validate ? validateValue(upPos.y) : upPos.y,
  };
  const validDownPos: Coord = {
    x: validate ? validateValue(downPos.x) : downPos.x,
    y: validate ? validateValue(downPos.y) : downPos.y,
  };

  // mouse interaction feedback: draw rectangle in selected area (if selection is active)
  return selection && !drag ? (
    <mesh
      position={[
        (validUpPos.x + validDownPos.x) / 2,
        (validUpPos.y + validDownPos.y) / 2,
        SELECT_DEPTH,
      ]}
      scale={1}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <planeGeometry
        attach={'geometry'}
        args={[Math.abs(validUpPos.x - validDownPos.x), Math.abs(validUpPos.y - validDownPos.y)]}
      />
      <meshStandardMaterial
        transparent={true}
        opacity={opacity}
        color={SELECT_HIGHLIGHT}
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
  setDrag: (drag: DragData | null) => void,
) => {
  const [upPos, setUpPos] = useState<Coord>({ x: 0, y: 0 }); // mouse down position
  const [upTime, setUpTime] = useState<number>(0);

  // pointer up
  useEffect(() => {
    const pointerUp = (e: PointerEvent) => {
      const newPos = getPos(mouse, camera);
      setDrag(null);

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
        case 'TEXT':
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
      }
    };

    domElement.addEventListener('pointerup', pointerUp);

    return () => domElement.removeEventListener('pointerup', pointerUp);
  }, [
    camera,
    clock.elapsedTime,
    domElement,
    mouse,
    setCameraPan,
    setDrag,
    setDrawRect,
    setSelection,
    tool,
  ]);

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
  setCurrentObj: (obj: string | null) => void,
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
        case 'TEXT':
          setDrawRect(false);
          e.stopPropagation(); // fall through
        case 'SELECT': // selection box on left click
          if (e.button === 0) {
            setSelection(true);
            setOpacity(MAX_OPACITY);
            setUpPos(newPos);
            setDownPos(newPos);
            setUpTime(0);
            setCurrentObj(null);
          }
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
    setCurrentObj,
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
  drag: DragData | null,
  invalidate: () => void,
  setUpPos: Dispatch<SetStateAction<Coord>>,
) => {
  useEffect(() => {
    const pointerMove = () => {
      if (drag !== null) {
        invalidate();
      }
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
  }, [camera, cameraPan, domElement, drag, invalidate, mouse, opacity, selection, setUpPos]);
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
  tool: Tool,
  upPos: Coord,
  downPos: Coord,
  drawRect: boolean,
  setDrawRect: Dispatch<SetStateAction<boolean>>,
  addObj: (obj: Obj) => void,
) => {
  useEffect(() => {
    const newObjPos = { x: Math.min(upPos.x, downPos.x), y: Math.min(upPos.y, downPos.y) };
    const newObjSize = { x: Math.abs(upPos.x - downPos.x), y: Math.abs(upPos.y - downPos.y) };
    if (drawRect) {
      // create and append obj
      const obj = (() => {
        switch (tool) {
          case 'RECT':
            return createRect(newObjPos.x, newObjPos.y, newObjSize.x, newObjSize.y);
          case 'TEXT':
            return createText(newObjPos.x, newObjPos.y, newObjSize.x);
        }
        return null;
      })();
      if (obj === null) return;
      addObj(obj);
      setDrawRect(false);
    }
  }, [addObj, downPos.x, downPos.y, drawRect, setDrawRect, tool, upPos.x, upPos.y]);
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

function handleDrag(obj: Obj, newPos: Coord, drag: DragData, updateObj: (obj: Obj) => void) {
  switch (obj.type) {
    case 'RECT':
      return handleRectDrag(obj as RectObj, newPos, drag, updateObj);
    case 'TEXT':
      return handleTextDrag(obj as TextObj, newPos, drag, updateObj);
    case 'ROOT':
      break;
    case 'LINE':
      return handleLineDrag(obj as LineObj, newPos, drag, updateObj);
  }
}

function handleRectDrag(
  obj: RectObj,
  newPos: Coord,
  drag: DragData,
  updateObj: (obj: Obj) => void,
) {
  switch (drag.mode) {
    case 'move':
      return updateObj({
        ...obj,
        x: validateValue(newPos.x + drag.prevObj.x - drag.mousePos.x),
        y: validateValue(newPos.y + drag.prevObj.y - drag.mousePos.y),
      } as Obj);
    case 'n':
      return updateObj({
        ...obj,
        h: validateValue(newPos.y - drag.prevObj.y, true),
      } as Obj);
    case 'e':
      return updateObj({
        ...obj,
        w: validateValue(newPos.x - drag.prevObj.x, true),
      } as Obj);
    case 'w':
      return updateObj({
        ...obj,
        w: validateValue(drag.prevObj.x + (drag.prevObj as RectObj).w - newPos.x, true),
        x: validateValue(newPos.x),
      } as Obj);
    case 's':
      return updateObj({
        ...obj,
        h: validateValue(drag.prevObj.y + (drag.prevObj as RectObj).h - newPos.y, true),
        y: validateValue(newPos.y),
      } as Obj);
  }
}

function handleTextDrag(
  obj: TextObj,
  newPos: Coord,
  drag: DragData,
  updateObj: (obj: Obj) => void,
) {
  switch (drag.mode) {
    case 'move':
      return updateObj({
        ...obj,
        x: validateValue(newPos.x + drag.prevObj.x - drag.mousePos.x),
        y: validateValue(newPos.y + drag.prevObj.y - drag.mousePos.y),
      } as Obj);
    case 'e':
      return updateObj({
        ...obj,
        w: validateValue(newPos.x - drag.prevObj.x, true),
      } as Obj);
    case 'w':
      return updateObj({
        ...obj,
        w: validateValue(drag.prevObj.x + (drag.prevObj as TextObj).w - newPos.x, true),
        x: validateValue(newPos.x),
      } as Obj);
  }
}

function handleLineDrag(
  obj: LineObj,
  newPos: Coord,
  drag: DragData,
  updateObj: (obj: Obj) => void,
) {
  const offset: Coord = {
    x: newPos.x - drag.mousePos.x,
    y: newPos.y - drag.mousePos.y,
  };
  switch (drag.mode) {
    case 'move':
      return updateObj({
        ...obj,
        x: validateValue(drag.prevObj.x + offset.x),
        x2: validateValue((drag.prevObj as LineObj).x2 + offset.x),
        y: validateValue(drag.prevObj.y + offset.y),
        y2: validateValue((drag.prevObj as LineObj).y2 + offset.y),
      } as LineObj);
    case 'ne':
      return updateObj({
        ...obj,
        x: validateValue(newPos.x),
        y: validateValue(newPos.y),
      } as Obj);
    case 'sw':
      return updateObj({
        ...obj,
        x2: validateValue(newPos.x),
        y2: validateValue(newPos.y),
      } as Obj);
  }
}
