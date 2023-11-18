'use client';
import { MutableRefObject, RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { invalidate, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { boundNumber, calculateLineGeometry, genColor, getPos } from '@/utils/whiteboardHelper';
import * as d3 from 'd3';
import SpriteText from 'three-spritetext';
import { useViewer } from '@/states/viewer';

const GAP = 10;
const RADIUS = 10;
const MAXSCALE = 1.2;
const MINSCALE = 0.5;
const MINDELTA = 0.01;
const WHEEL_DELTA_FACTOR = 100;
const WHEEL_MAX_DELTA = 20;
const PAN_MAX_DELTA = 100;
const MAX_ZOOM = 10000;
const MIN_ZOOM = 0.1;
const LABEL_COLOR_STRING = '#383b40';
const COLOR_STALE_STRING = 'grey';
const COLOR_STALE = new THREE.Color(COLOR_STALE_STRING);
const COLOR_STALE_BACK_STRING = '#d8dadd';
const COLOR_STALE_BACK = new THREE.Color(COLOR_STALE_BACK_STRING);
const COLOR_HIGHLIGHT_STRING = '#027373';
const COLOR_HIGHLIGHT = new THREE.Color(COLOR_HIGHLIGHT_STRING);

interface GraphRendererProps {
  data: Map<number, GraphData>; // documentId : graphData
}

export default function GraphRenderer({ data }: GraphRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.CircleGeometry(1, 32), []);
  const lineGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const nodeMaterial = useMemo(() => new THREE.MeshBasicMaterial(), []);
  const lineMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({ color: LABEL_COLOR_STRING, opacity: 0.3, transparent: true }),
    [],
  );
  const lineMesh = useRef<THREE.InstancedMesh>();
  const circleMesh = useRef<THREE.InstancedMesh>();
  const currentDocumentId = useViewer((state) => state.document?.documentId);
  const staleColorMapRef = useRef<Map<number, THREE.Color>>(new Map());
  const { camera } = useThree();

  // reset camera
  useEffect(() => {
    camera.position.set(0, 0, 1000);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
  }, [camera, data]);

  const meshFactory = useCallback(
    (nodes: NodeData[], links: LinkData[]) => {
      // create node instancedMesh
      circleMesh.current = new THREE.InstancedMesh(geometry, nodeMaterial, nodes.length);
      circleMesh.current.position.setZ(10);
      circleMesh.current.frustumCulled = false;
      // need to set color once before render!
      circleMesh.current.setColorAt(0, COLOR_STALE);
      groupRef.current!.add(circleMesh.current);

      // create line instancedMesh
      lineMesh.current = new THREE.InstancedMesh(lineGeometry, lineMaterial, links.length);
      lineMesh.current.frustumCulled = false;
      groupRef.current!.add(lineMesh.current);
    },
    [geometry, lineGeometry, lineMaterial, nodeMaterial],
  );

  const nodeDataFactory = useCallback(
    (documentId: number, entries: IterableIterator<[number, string]>) => {
      const nodes: NodeData[] = [];
      // generate color
      const color = documentId === currentDocumentId ? COLOR_STALE_STRING : genColor();
      staleColorMapRef.current.set(documentId, new THREE.Color(color));
      for (const [id, keyword] of entries) {
        // label
        const text = new SpriteText(keyword, 28, color) as ExtendedSpriteText;
        text.position.setZ(15);
        text.strokeColor = 'white';
        text.strokeWidth = 2;
        text.initialScale = { x: text.scale.x, y: text.scale.y };
        groupRef.current!.add(text);

        nodes.push({
          documentId: documentId,
          id: `${documentId}-${id}`,
          children: [],
          label: keyword,
          labelMesh: text,
          scale: 1,
          selected: false,
        } as NodeData);
      }

      return nodes;
    },
    [currentDocumentId],
  );

  const linkDataFactory = useCallback(
    (documentId: number, entries: IterableIterator<[string, number[]]>) => {
      const links: LinkData[] = [];
      for (const [key, children] of entries) {
        const id = parseInt(key);
        for (const child of children) {
          links.push({
            source: `${documentId}-${id}`,
            target: `${documentId}-${child}`,
            documentId: documentId,
          } as LinkData);
        }
      }
      return links;
    },
    [],
  );

  const { simulationRef, linksRef } = useSimulation(
    data,
    groupRef,
    nodeDataFactory,
    linkDataFactory,
    meshFactory,
  );

  const { selectedNodeRef, hoverNodeRef, pointerDownRef } = usePointer(simulationRef, circleMesh);

  useFocusCallback(selectedNodeRef);

  // update scene
  useFrame(({ camera }) => {
    if (
      groupRef.current === null ||
      lineMesh.current === undefined ||
      circleMesh.current === undefined
    )
      return;
    const nodes = simulationRef.current.nodes();
    const links = linksRef.current;
    const inverseZoom = 1 / camera.zoom;

    // update node meshes
    const labelScale = Math.min(inverseZoom, 1);
    const needFocusOnNode =
      pointerDownRef.current?.intersection?.node !== undefined ||
      hoverNodeRef.current !== undefined;
    const labelOpacityBasedOnZoom = Math.max(0, Math.min(1, (camera.zoom - 0.5) / 0.2));
    const labelOpacity = needFocusOnNode
      ? Math.min(0.4, labelOpacityBasedOnZoom)
      : labelOpacityBasedOnZoom;

    nodes.forEach((node, i) => {
      const staleColor = staleColorMapRef.current.get(node.documentId) ?? COLOR_STALE;
      const defaultColor = needFocusOnNode ? COLOR_STALE_BACK : staleColor;
      const m = new THREE.Matrix4();
      if (node === selectedNodeRef.current?.node) {
        // selected node
        node.labelMesh!.material.opacity = 1;
        circleMesh.current?.setColorAt(i, COLOR_HIGHLIGHT);
        node.labelMesh?.position.setZ(20);
        m.setPosition(node.x ?? 0, node.y ?? 0, 18);
        circleMesh.current?.setMatrixAt(i, m);
      } else if (
        node === hoverNodeRef.current?.node ||
        node === pointerDownRef.current?.intersection?.node
      ) {
        // hovering node
        node.labelMesh!.material.opacity = 1;
        circleMesh.current?.setColorAt(i, COLOR_STALE);
        m.setPosition(node.x ?? 0, node.y ?? 0, 18);
      } else {
        // stale node
        node.labelMesh!.material.opacity = labelOpacity;
        circleMesh.current?.setColorAt(i, defaultColor);
        node.labelMesh?.position.setZ(15);
        m.setPosition(node.x ?? 0, node.y ?? 0, 0);
      }

      m.scale(new THREE.Vector3(node.scale * RADIUS, node.scale * RADIUS, 1));
      circleMesh.current?.setMatrixAt(i, m);
      node.labelMesh?.position.setX(node.x ?? 0);
      node.labelMesh?.position.setY((node.y ?? 0) + (RADIUS + 15) * node.scale);
      node.labelMesh?.scale.set(
        labelScale * node.scale * node.labelMesh.initialScale.x,
        labelScale * node.scale * node.labelMesh.initialScale.y,
        1,
      );
    });
    circleMesh.current.instanceColor!.needsUpdate = true;
    circleMesh.current.instanceMatrix.needsUpdate = true;

    // update link meshes
    links.forEach((link, i) => {
      const source = link.source as NodeData;
      const target = link.target as NodeData;
      const x = source.x ?? 0;
      const y = source.y ?? 0;
      const x2 = target.x ?? 0;
      const y2 = target.y ?? 0;
      const { w, d } = calculateLineGeometry(x, y, x2, y2);
      const m = new THREE.Matrix4()
        .makeRotationZ(d)
        .setPosition((x + x2) / 2, (y + y2) / 2, 0)
        .scale(new THREE.Vector3(w, inverseZoom, 1));
      lineMesh.current?.setMatrixAt(i, m);
    });
    lineMesh.current.instanceMatrix.needsUpdate = true;
  });

  return <group ref={groupRef}></group>;
}

function usePointer(
  simulationRef: MutableRefObject<d3.Simulation<NodeData, undefined>>,
  nodeMeshRef?: MutableRefObject<THREE.InstancedMesh | undefined>,
) {
  const {
    gl: { domElement },
    mouse,
    camera,
  } = useThree();
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const selectedNodeRef = useRef<RayCastResult>(); // current selection
  const hoverNodeRef = useRef<RayCastResult>();
  const pointerDownRef = useRef<PointerHistory>();

  const { setSelectedNode, selectedNode } = useViewer((state) => ({
    setSelectedNode: state.setSelectedNode,
    selectedNode: state.selectedNode,
  }));

  // synchronize selectedNode with global state
  useEffect(() => {
    if (selectedNode === undefined) return;
    selectedNodeRef.current = { node: selectedNode, offset: new THREE.Vector2(0, 0) };
    invalidate();
  }, [selectedNode]);

  // pointer event handlers
  useEffect(() => {
    const pointerMove = () => invalidate();

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

    const pointerUp = (e: MouseEvent) => {
      e.preventDefault();
      if (pointerDownRef.current === undefined) return;
      const upPos = new THREE.Vector2(e.clientX, e.clientY);
      const down = pointerDownRef.current;
      pointerDownRef.current = undefined;
      if (selectedNodeRef.current === undefined) return;
      selectedNodeRef.current.node.fx = undefined;
      selectedNodeRef.current.node.fy = undefined;
      const isBlankClick =
        upPos.x === down.pos.x && upPos.y === down.pos.y && down.intersection === undefined;
      if (isBlankClick) {
        selectedNodeRef.current = undefined;
      }
      simulationRef.current.alphaTarget(0);
      invalidate();
    };

    const pointerDown = (e: MouseEvent) => {
      e.preventDefault();
      if (nodeMeshRef?.current === undefined) return;
      const intersection = intersectingNode(
        simulationRef.current.nodes(),
        raycasterRef.current,
        nodeMeshRef.current,
      );
      pointerDownRef.current = {
        realPos: getPos(mouse, camera),
        pos: new THREE.Vector2(e.clientX, e.clientY),
        intersection: intersection,
      };
      if (intersection === undefined) return;
      // pointer down on node
      setSelectedNode(intersection.node);
      selectedNodeRef.current = intersection;
      simulationRef.current.alphaTarget(0.1).restart();
    };
    domElement.addEventListener('mousemove', pointerMove);
    domElement.addEventListener('mouseup', pointerUp);
    domElement.addEventListener('mousedown', pointerDown);
    domElement.addEventListener('wheel', wheel);
    return () => {
      domElement.removeEventListener('mousemove', pointerMove);
      domElement.removeEventListener('mouseup', pointerUp);
      domElement.removeEventListener('mousedown', pointerDown);
      domElement.removeEventListener('wheel', wheel);
    };
  }, [camera, domElement, mouse, nodeMeshRef, raycasterRef, setSelectedNode, simulationRef]);

  useEffect(() => {
    const raycast = setInterval(() => {
      raycasterRef.current.setFromCamera(mouse, camera);
      // get hovering node
      if (nodeMeshRef?.current == undefined) return;
      nodeMeshRef.current.computeBoundingSphere();
      hoverNodeRef.current = intersectingNode(
        simulationRef.current.nodes(),
        raycasterRef.current,
        nodeMeshRef.current,
      );
    }, 10);
    return () => clearInterval(raycast);
  }, [camera, mouse, nodeMeshRef, raycasterRef, simulationRef, domElement]);

  // mouse handler
  useFrame(({ camera, mouse }) => {
    const nodes = simulationRef.current.nodes();
    const inverseZoom = 1 / camera.zoom;

    // pointer is clicked
    if (pointerDownRef.current !== undefined) {
      const intersection = pointerDownRef.current.intersection;
      const mouseRealPos = getPos(mouse, camera);
      if (intersection !== undefined) {
        // node is selected -> move node
        intersection.node.fx = mouseRealPos.x + intersection.offset.x;
        intersection.node.fy = mouseRealPos.y + intersection.offset.y;
      } else {
        // node is not selected -> pan camera
        camera.position.setX(
          pointerDownRef.current.realPos.x - (mouseRealPos.x - camera.position.x),
        );
        camera.position.setY(
          pointerDownRef.current.realPos.y - (mouseRealPos.y - camera.position.y),
        );
      }
    }

    const node_scale_max = Math.max(MAXSCALE * inverseZoom, MAXSCALE);
    for (const node of nodes) {
      if (node === selectedNodeRef.current?.node || node === hoverNodeRef.current?.node) {
        if (node.scale < node_scale_max) {
          // scale needs update
          node.scale += Math.max((node_scale_max - node.scale) / 5, MINDELTA);
          invalidate();
        } else node.scale = node_scale_max;
      } else {
        // node.group.position.setZ(0);
        if (node.scale > MINSCALE) {
          // scale needs update
          node.scale -= Math.max((node.scale - MINSCALE) / 5, MINDELTA);
          invalidate();
        } else node.scale = MINSCALE;
      }
    }
  });

  return { selectedNodeRef, hoverNodeRef, pointerDownRef };
}

function useSimulation(
  data: Map<number, GraphData>,
  groupRef: RefObject<THREE.Group>,
  nodeDataFactory: (documentId: number, entries: IterableIterator<[number, string]>) => NodeData[],
  linkDataFactory: (
    documentId: number,
    entries: IterableIterator<[string, number[]]>,
  ) => LinkData[],
  meshFactory: (nodes: NodeData[], links: LinkData[]) => void,
) {
  const simulationRef = useRef<d3.Simulation<NodeData, undefined>>(d3.forceSimulation<NodeData>());
  const linksRef = useRef<LinkData[]>([]);

  useEffect(() => {
    // if simulation exists, stop
    if (simulationRef.current != null) simulationRef.current.stop();

    // regenerated on graph data update
    if (groupRef.current == null) {
      return;
    }

    // remove items from mesh group
    for (const child of groupRef.current.children) {
      child.removeFromParent();
      if (child.hasOwnProperty('dispose')) (child as any).dispose(); // prevent memory leak
    }

    groupRef.current.clear();

    const nodes: NodeData[] = [];
    linksRef.current = [];

    // support multiple data
    for (const [documentId, graphData] of data) {
      // generate nodes
      const newNodes = nodeDataFactory(documentId, graphData.keywords.entries());
      const nodesMap: Map<string, NodeData> = new Map();
      for (const node of newNodes) {
        nodes.push(node);
        nodesMap.set(node.id, node);
      }

      // generate links
      const graph = new Map<string, number[]>(Object.entries(graphData.graph));
      const newLinks = linkDataFactory(documentId, graph.entries());

      // save links in nodes for future use
      for (const link of newLinks) {
        linksRef.current.push(link);
        nodesMap.get(link.source as string)?.children.push(nodesMap.get(link.target as string)!);
        nodesMap.get(link.target as string)?.children.push(nodesMap.get(link.source as string)!);
      }
    }

    // generate meshes (from graphRenderer context)
    meshFactory(nodes, linksRef.current);

    simulationRef.current
      .nodes(nodes)
      .force('charge', d3.forceManyBody<NodeData>().strength(-500).distanceMax(500))
      .force(
        'link',
        d3
          .forceLink<NodeData, LinkData>(linksRef.current)
          .id((node, i, nodesData) => node.id)
          .strength(1),
      )
      .force('collision', d3.forceCollide(GAP))
      .tick(50);

    simulationRef.current.alpha(1).stop();
    invalidate();
  }, [data, groupRef, linkDataFactory, meshFactory, nodeDataFactory]);

  // simulation tick on frame
  useFrame((_state, delta) => {
    if (simulationRef.current.alpha() < simulationRef.current.alphaMin()) return;
    simulationRef.current.tick(delta);
    invalidate();
  });
  return { simulationRef, linksRef };
}

function intersectingNode(
  nodes: NodeData[],
  rayCaster: THREE.Raycaster,
  mesh: THREE.InstancedMesh,
) {
  // check intersection
  if (mesh === undefined) return undefined;
  // circle
  const points = rayCaster.intersectObjects([mesh]);
  if (points.length > 0) {
    const id = points[0].instanceId;
    if (id === undefined) return undefined;
    return {
      node: nodes[id],
      offset: new THREE.Vector2(
        (nodes[id].x ?? 0) - points[0].point.x,
        (nodes[id].y ?? 0) - points[0].point.y,
      ),
    };
  }
  // label
  // for (const node of nodes) {
  //   if (node.labelMesh === undefined) continue;
  //   const points = rayCaster.intersectObject(node.labelMesh);
  //   if (points.length > 0) {
  //     return {
  //       node: node,
  //       offset: new THREE.Vector2(
  //         (node.x ?? 0) - points[0].point.x,
  //         (node.y ?? 0) - points[0].point.y,
  //       ),
  //     };
  //   }
  // }
  return undefined;
}

interface RayCastResult {
  node: NodeData;
  offset: THREE.Vector2;
}

interface PointerHistory {
  pos: THREE.Vector2;
  realPos: THREE.Vector2;
  intersection?: RayCastResult;
}

function useFocusCallback(selectedNodeRef: MutableRefObject<RayCastResult | undefined>) {
  const { camera } = useThree();
  const setFocusCallback = useViewer((state) => state.setFocusNodeCallback);
  const vector = useMemo(() => new THREE.Vector2(0, 0), []);
  useEffect(() => {
    setFocusCallback((node) => {
      selectedNodeRef.current = { node: node, offset: vector };
      camera.position.set(node.x ?? 0, node.y ?? 0, camera.position.z);
      invalidate();
    });
    return () => setFocusCallback(undefined);
  }, [camera, selectedNodeRef, setFocusCallback, vector]);
}
