'use client';
import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { invalidate, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DEFAULT_FONT, boundNumber, calculateLineGeometry, getPos } from '@/utils/whiteboardHelper';
import * as d3 from 'd3';
// @ts-ignore
import { Text, preloadFont } from 'troika-three-text';
import { useGraph } from '@/states/graph';

const GAP = 10;
const RADIUS = 5;
const MAXSCALE = 2;
const MINSCALE = 1;
const MINDELTA = 0.01;
const WHEEL_DELTA_FACTOR = 100;
const WHEEL_MAX_DELTA = 20;
const PAN_MAX_DELTA = 100;
const MAX_ZOOM = 10000;
const MIN_ZOOM = 0.1;
const COLOR_STALE = new THREE.Color('grey');
const COLOR_HIGHLIGHT = new THREE.Color('blue');

interface GraphRendererProps {
  data: GraphData;
}

export default function GraphRenderer({ data }: GraphRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [fontLoaded, setFontLoaded] = useState<boolean>(false);
  const geometry = useMemo(() => new THREE.CircleGeometry(1, 32), []);
  const lineGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const nodeMaterial = useMemo(() => new THREE.MeshBasicMaterial(), []);
  const lineMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 'grey', opacity: 0.3, transparent: true }),
    [],
  );

  const lineMesh = useRef<THREE.InstancedMesh>();
  const circleMesh = useRef<THREE.InstancedMesh>();

  const nodeDataFactory = useCallback(
    (entries: IterableIterator<[number, string]>) => {
      const nodes: NodeData[] = [];
      for (const [id, keyword] of entries) {
        // circle
        // label
        const text = new Text();
        text.font = DEFAULT_FONT;
        text.fontSize = 15;
        text.text = keyword;
        text.color = 'black';
        text.position.setZ(15);
        text.position.setY(RADIUS);
        text.anchorX = 'center';
        text.anchorY = 'bottom';
        text.transparent = false;
        text.outlineWidth = 2;
        text.outlineColor = 'white';
        groupRef.current!.add(text);

        nodes.push({
          id: id,
          label: keyword,
          labelMesh: text,
          scale: 1,
          selected: false,
        } as NodeData);
      }

      // create instancedMesh
      circleMesh.current = new THREE.InstancedMesh(geometry, nodeMaterial, nodes.length);
      circleMesh.current.position.setZ(10);
      circleMesh.current.frustumCulled = false;
      // need to set color once before render!
      circleMesh.current.setColorAt(0, COLOR_STALE);
      groupRef.current!.add(circleMesh.current);

      return nodes;
    },
    [geometry, nodeMaterial],
  );

  const linkDataFactory = useCallback(
    (entries: IterableIterator<[string, number[]]>) => {
      const links: LinkData[] = [];
      for (const [key, children] of entries) {
        const id = parseInt(key);
        for (const child of children) {
          links.push({ source: id, target: child } as LinkData);
        }
      }
      // create instancedMesh
      lineMesh.current = new THREE.InstancedMesh(lineGeometry, lineMaterial, links.length);
      lineMesh.current.frustumCulled = false;
      groupRef.current!.add(lineMesh.current);
      return links;
    },
    [lineGeometry, lineMaterial],
  );

  const { simulationRef, linksRef } = useSimulation(
    data,
    groupRef,
    fontLoaded,
    nodeDataFactory,
    linkDataFactory,
  );

  const { selectedNodeRef } = usePointer(simulationRef, circleMesh);

  // simulation begins after font preload
  preloadFont({ font: DEFAULT_FONT }, () => setFontLoaded(true));

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
    nodes.forEach((node, i) => {
      const m = new THREE.Matrix4()
        .setPosition(node.x ?? 0, node.y ?? 0, 0)
        .scale(new THREE.Vector3(node.scale * RADIUS, node.scale * RADIUS, 1));
      circleMesh.current?.setMatrixAt(i, m);
      if (node === selectedNodeRef.current?.node) {
        circleMesh.current?.setColorAt(i, COLOR_HIGHLIGHT);
      } else {
        circleMesh.current?.setColorAt(i, COLOR_STALE);
      }

      node.labelMesh?.position.setX(node.x ?? 0);
      node.labelMesh?.position.setY((node.y ?? 0) + RADIUS * node.scale);
      node.labelMesh?.scale.set(node.scale, node.scale, 1);
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

  const setSelected = useGraph((state) => state.setSelected);

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
        setSelected(undefined);
        selectedNodeRef.current = undefined;
      }
      simulationRef.current.alphaTarget(0);
      invalidate();
    };

    const pointerDown = (e: MouseEvent) => {
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
      setSelected(intersection.node);
      selectedNodeRef.current = intersection;
      simulationRef.current.alphaTarget(0.1).restart();
    };
    domElement.addEventListener('pointermove', pointerMove);
    domElement.addEventListener('pointerup', pointerUp);
    domElement.addEventListener('pointerdown', pointerDown);
    domElement.addEventListener('wheel', wheel);
    return () => {
      domElement.removeEventListener('pointermove', pointerMove);
      domElement.removeEventListener('pointerup', pointerUp);
      domElement.removeEventListener('pointerdown', pointerDown);
      domElement.removeEventListener('wheel', wheel);
    };
  }, [camera, domElement, mouse, nodeMeshRef, raycasterRef, setSelected, simulationRef]);

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

  return { selectedNodeRef };
}

function useSimulation(
  data: GraphData,
  groupRef: RefObject<THREE.Group>,
  fontLoaded: boolean,
  nodeDataFactory: (entries: IterableIterator<[number, string]>) => NodeData[],
  linkDataFactory: (entries: IterableIterator<[string, number[]]>) => LinkData[],
) {
  const simulationRef = useRef<d3.Simulation<NodeData, undefined>>(d3.forceSimulation<NodeData>());
  const linksRef = useRef<LinkData[]>([]);

  useEffect(() => {
    // if simulation exists, stop
    if (simulationRef.current != null) simulationRef.current.stop();

    // regenerated on graph data update
    if (groupRef.current == null) return;

    // remove items from mesh group
    for (const child of groupRef.current.children) {
      child.removeFromParent();
      if (child.hasOwnProperty('dispose')) (child as any).dispose(); // prevent memory leak
    }

    groupRef.current.clear();

    if (!fontLoaded) return;

    // generate nodes
    const nodes: NodeData[] = nodeDataFactory(data.keywords.entries());

    // generate links
    const graph = new Map<string, number[]>(Object.entries(data.graph));
    linksRef.current = linkDataFactory(graph.entries());

    simulationRef.current
      .nodes(nodes)
      .force('charge', d3.forceManyBody<NodeData>().strength(-1000).distanceMax(500))
      .force(
        'link',
        d3
          .forceLink<NodeData, LinkData>(linksRef.current)
          .id((d) => d.id)
          .strength(1),
      )
      .force('center', d3.forceCenter(0, 0).strength(1))
      .force('collision', d3.forceCollide(GAP))
      .tick(50);

    simulationRef.current.alpha(1).stop();
    invalidate();
  }, [data.graph, data.keywords, fontLoaded, groupRef, linkDataFactory, nodeDataFactory]);

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
  if (mesh === undefined) return undefined;
  // check intersection
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
