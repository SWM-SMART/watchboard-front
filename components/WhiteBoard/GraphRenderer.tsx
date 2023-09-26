'use client';
import * as d3 from 'd3';
import { RendererProps } from './NodeRenderer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { invalidate, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Group } from 'three';
import { useWhiteBoard } from '@/states/whiteboard';
import { DEFAULT_FONT, calculateLineGeometry, genId } from '@/utils/whiteboardHelper';
// @ts-ignore
import { Text, preloadFont } from 'troika-three-text';
import { Text as DreiText } from '@react-three/drei';
import { FlatLine, FlatLineRef } from './LineObjRenderer';

// Live graph : graph constantly updated by text2graph model, user cannot modify
export function LiveGraphRenderer({ objId, dimensionsRef }: RendererProps) {
  const planeMaterial = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({ color: 'grey', transparent: false });
    material.depthTest = true;
    material.depthWrite = true;
    return material;
  }, []);
  const planeGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  const obj = useWhiteBoard((state) => state.objMap.get(objId) as LiveGraphObj);

  const graphRef = useRef<d3.TreeLayout<number>>();
  const dataRef = useRef<d3.HierarchyPointNode<number>>();
  const groupRef = useRef<Group>(null);
  const [fontLoaded, setFontLoaded] = useState<boolean>(false);

  // render after font preload
  preloadFont({ font: DEFAULT_FONT }, () => {
    setFontLoaded(true);
    invalidate();
  });

  useFrame(() => {
    if (
      dataRef.current === undefined ||
      graphRef.current === undefined ||
      dimensionsRef === undefined ||
      groupRef.current === null
    )
      return;
    dimensionsRef.current.x = obj.x;
    dimensionsRef.current.y = obj.y;
    groupRef.current.position.set(obj.x, obj.y, obj.depth);
  });

  // update tree layout
  useEffect(() => {
    if (groupRef.current === null) return;
    // remove items from mesh group
    for (const child of groupRef.current.children) {
      child.removeFromParent();
      if (child.hasOwnProperty('dispose')) (child as any).dispose(); // prevent memory leak
    }
    groupRef.current.clear();

    if (!fontLoaded) return;

    const children = new Map<string, number[]>(Object.entries(obj.data.graph));
    const root = d3.hierarchy<number>(obj.data.root, (d) => {
      return children.get(d.toString());
    });

    graphRef.current = d3.tree<number>().nodeSize([30, 300]);
    dataRef.current = graphRef.current(root);

    // link meshes
    for (const v of dataRef.current.links()) {
      const link = new THREE.Mesh(planeGeometry, planeMaterial);
      const { w, d } = calculateLineGeometry(v.source.y, v.source.x, v.target.y, v.target.x);
      link.scale.setX(w);
      link.rotation.set(0, 0, d);
      link.position.set((v.source.y + v.target.y) / 2, (v.source.x + v.target.x) / 2, obj.depth);
      groupRef.current.add(link);
    }

    // node meshes
    for (const v of dataRef.current.descendants()) {
      const text = new Text();
      text.name = 'label';
      text.font = DEFAULT_FONT;
      text.fontSize = 15;
      text.text = obj.data.keywords[v.data];
      text.color = 'black';
      text.position.setX(v.y);
      text.position.setY(v.x);
      text.position.setZ(obj.depth);
      text.anchorX = 'center';
      text.anchorY = 'middle';
      text.transparent = false;
      text.outlineWidth = 5;
      text.outlineColor = 'white';
      groupRef.current.add(text);
    }
  }, [
    fontLoaded,
    obj.data.graph,
    obj.data.keywords,
    obj.data.root,
    obj.depth,
    planeGeometry,
    planeMaterial,
  ]);

  return (
    <group
      onClick={() => {
        // TODO: create a proper ui for this function
        // fixes and objectify current LiveGraph
        objectifyGraph(objId);
      }}
      ref={groupRef}
    ></group>
  );
}

export function GraphRootRenderer({ objId, dimensionsRef, groupRef }: RendererProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId) as GraphRootObj);

  useFrame(() => {
    if (groupRef === undefined || groupRef.current === null || obj === undefined) return;
    groupRef.current.position.setX(obj.x);
    groupRef.current.position.setY(obj.y);
    groupRef.current.position.setZ(obj.depth);
  });

  return (
    <DreiText
      font={DEFAULT_FONT}
      fontSize={15}
      color={'black'}
      lineHeight={1}
      position={[0, 0, 0]}
      anchorX={'center'}
      anchorY={'middle'}
      outlineColor={'white'}
      outlineWidth={5}
      onAfterRender={(_renderer, _scene, _camera, geometry) => {
        if (geometry.boundingBox === null || dimensionsRef === undefined) return;
        dimensionsRef.current.h = 10 + geometry.boundingBox.max.y - geometry.boundingBox.min.y;
        dimensionsRef.current.w = 10 + geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        dimensionsRef.current.x = geometry.boundingBox.min.x - 5;
        dimensionsRef.current.y = geometry.boundingBox.min.y - 5;
      }}
    >
      {obj.label}
    </DreiText>
  );
}

export function GraphNodeRenderer({ objId, dimensionsRef, groupRef }: RendererProps) {
  const obj = useWhiteBoard((state) => state.objMap.get(objId) as GraphNodeObj);
  const lineRef = useRef<FlatLineRef>(null);

  useFrame(() => {
    if (
      groupRef === undefined ||
      groupRef.current === null ||
      obj === undefined ||
      lineRef.current === null
    )
      return;
    groupRef.current.position.setX(obj.x);
    groupRef.current.position.setY(obj.y);
    groupRef.current.position.setZ(-0.00000000001); // gap between nodes
    lineRef.current.setPoints(0, 0, -obj.x, -obj.y, 1);
  });

  return (
    <>
      <DreiText
        font={DEFAULT_FONT}
        fontSize={15}
        color={'black'}
        lineHeight={1}
        position={[0, 0, 0]}
        anchorX={'center'}
        anchorY={'middle'}
        outlineColor={'white'}
        outlineWidth={5}
        onAfterRender={(_renderer, _scene, _camera, geometry) => {
          if (geometry.boundingBox === null || dimensionsRef === undefined) return;
          dimensionsRef.current.h = 10 + geometry.boundingBox.max.y - geometry.boundingBox.min.y;
          dimensionsRef.current.w = 10 + geometry.boundingBox.max.x - geometry.boundingBox.min.x;
          dimensionsRef.current.x = geometry.boundingBox.min.x - 5;
          dimensionsRef.current.y = geometry.boundingBox.min.y - 5;
        }}
      >
        {obj.label}
      </DreiText>
      <FlatLine
        ref={lineRef}
        x={0}
        y={0}
        x2={-obj.x}
        y2={-obj.y}
        strokeWidth={1}
        color={'grey'}
        depth={-0.0000001}
      />
    </>
  );
}

// Live graph -> graph: convert every node to objs
function objectifyGraph(objId: string) {
  const obj = useWhiteBoard.getState().objMap.get(objId) as LiveGraphObj;
  const objs: Obj[] = [];

  // create graph data
  const children = new Map<string, number[]>(Object.entries(obj.data.graph));
  const root = d3.hierarchy<number>(obj.data.root, (d) => {
    return children.get((d as number).toString());
  });

  // create tree layout
  const tree = d3.tree<number>().nodeSize([30, 300])(root);

  // nodes
  const nodes = new Map<number, GraphNodeObj | GraphRootObj>();
  for (const v of tree.descendants()) {
    const node: GraphNodeObj | GraphRootObj =
      v.parent === null
        ? {
            type: 'GRAPHROOT',
            label: obj.data.keywords[v.data],
            objId: obj.objId,
            x: v.y,
            y: v.x,
            depth: obj.depth,
            parentId: obj.parentId,
          }
        : {
            type: 'GRAPHNODE',
            label: obj.data.keywords[v.data],
            objId: obj.data.keywords[v.data] + genId(),
            x: v.y - (v.parent?.y ?? 0),
            y: v.x - (v.parent?.x ?? 0),
            depth: obj.depth,
            parentId: obj.objId,
          };
    nodes.set(v.data, node);
  }

  // edges
  for (const v of tree.links()) {
    const parent = nodes.get(v.source.data);
    const child = nodes.get(v.target.data);
    if (parent === undefined || child === undefined) continue;
    child.parentId = parent.objId;
    child.x;
    child.y;
  }

  for (const [_i, node] of nodes) {
    objs.push(node);
  }

  for (const newObj of objs) {
    // change current Obj (liveGraph -> graph)
    if (newObj.objId === obj.objId) useWhiteBoard.getState().updateObj(newObj);
    // add new objs (nodes, edges)
    else useWhiteBoard.getState().addObj(newObj, false);
  }

  // update render tree
  useWhiteBoard.getState().syncObjTree();
}
