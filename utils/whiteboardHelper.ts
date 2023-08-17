import { useWhiteBoard } from '@/states/whiteboard';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
} from 'd3';
import { Camera, Vector2, Vector3 } from 'three';

export const SELECT_HIGHLIGHT = '#9edae6';
export const SELECT_HIGHLIGHT_OPACITY = 0;
export const SELECT_DEPTH = 1;
export const FRAME_DEPTH = 1.0001;
export const FRAME_CORNER_DEPTH = 1.0002;
export const FRAME_COLOR = '#3491e3';
export const FRAME_WIDTH = 5;
const MAX_DEPTH = 1;
const MIN_DEPTH = 0;

export const rootObj: Obj = {
  objId: 'ROOT',
  type: 'ROOT',
  x: 0,
  y: 0,
  depth: MIN_DEPTH,
  parentId: '',
};

/**
 * Generate object id
 *
 * @return {number} Generated object id based on current time
 */
export function genId(): string {
  return (new Date().getTime() * Math.random()).toString().replaceAll('.', '');
}

/**
 * Generate depth value between objA and objB
 *
 * @param {Obj} [objA] the object that stays below (optional) if left blank, uses MIN_DEPTH
 * @param {Obj} [objB] the object that stays above (optional) if left blank, uses MAX_DEPTH
 * @return {number} Generated depth value.
 */
export function genDepth(objA?: Obj, objB?: Obj): number {
  if (objA === undefined && objB === undefined) return topDepth();
  if (objA === undefined) return MIN_DEPTH;
  if (objB === undefined)
    return objA.depth + 0.0001 < 1 ? objA.depth + 0.0001 : (objA.depth + MAX_DEPTH) / 2;
  return (objA.depth + objB.depth) / 2;
}

/**
 * get depth value between top object and MAX_DEPTH
 *
 * @return {number} Generated depth value.
 */
export function topDepth(): number {
  console.log(useWhiteBoard.getState().objTree);
  const rootObjNode = useWhiteBoard.getState().objTree;
  if (rootObjNode.childNodes.length === 0) {
    return 0.0001;
  }
  const currentTop = rootObjNode.childNodes[0].depth || rootObjNode.depth;
  return currentTop + 0.0001 < MAX_DEPTH ? currentTop + 0.0001 : (currentTop + MAX_DEPTH) / 2;
}

/**
 * Generate random color
 *
 * @return {string} Generated random color value in rgb string
 */
export function genColor(): string {
  return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(
    Math.random() * 255,
  )})`;
}

/**
 * Create Rectangle Object based on input parameter
 *
 * @param {number} [x] x position
 * @param {number} [y] y position
 * @param {number} [w] width value
 * @param {number} [h] height value
 * @param {string} [color=genColor()] rgb string
 * @param {number} [depth=genDepth()] depth value
 * @return {RectObj} generated Rectangle Object based on input parameter
 */
export function createRect(
  x: number,
  y: number,
  w: number,
  h: number,
  color: string = genColor(),
  depth: number = genDepth(),
): RectObj {
  // automatically validates
  return validateRectObj({
    objId: genId(),
    type: 'RECT',
    x: x,
    y: y,
    w: w,
    h: h,
    depth: depth,
    color: color,
    parentId: 'ROOT',
  } as RectObj);
}

/**
 * Create Text Object based on input parameter
 *
 * @param {number} [x] x position
 * @param {number} [y] y position
 * @param {number} [w] width value
 * @param {number} [depth=genDepth()] depth value
 * @param {TextOptions} [options] other optional properties
 * @return {TextObj} generated Text Object based on input parameter
 */
export function createText(
  x: number,
  y: number,
  w: number,
  depth: number = genDepth(),
  options?: TextOptions,
): TextObj {
  return validateTextObj({
    objId: genId(),
    type: 'TEXT',
    x: x,
    y: y,
    depth: depth,
    parentId: 'ROOT',
    w: w,
    fontSize: options?.fontSize ?? 30,
    overflow: options?.overflow ?? 'normal',
    text: options?.text ?? '',
    color: options?.color ?? genColor(),
    textAlign: options?.textAlign ?? 'left',
  } as TextObj);
}

/**
 * Create Line Object based on input parameter
 *
 * @param {number} [x] x value
 * @param {number} [y] y value
 * @param {number} [x2] x2 value
 * @param {number} [y2] y2 value
 * @param {number} [depth=genDepth()] depth value
 * @param {LineOptions} [options] other options
 * @return {LineObj} generated Line Object based on input parameter
 */
export function createLine(
  x: number,
  y: number,
  x2: number,
  y2: number,
  depth: number = genDepth(),
  options?: LineOptions,
): LineObj {
  return validateLineObj({
    objId: genId(),
    type: 'LINE',
    x: x,
    y: y,
    x2: x2,
    y2: y2,
    strokeWidth: options?.strokeWidth ?? 3,
    depth: depth,
    parentId: 'ROOT',
    color: options?.color ?? genColor(),
  } as LineObj);
}

/**
 * Returns real position of mouse inside canvas
 *
 * @param {Vector2} [mouse] target mouse object to find coordinates of
 * @param {Camera} [camera] camera object to find coordinates with
 * @param {boolean} [validate=false] validate coords
 * @return {RectObj} generated Rectangle Object based on input parameter
 */
const vector3 = new Vector3();
export function getPos(mouse: Vector2, camera: Camera, validate: boolean = false) {
  const { x, y } = vector3.set(mouse.x, mouse.y, 0).unproject(camera);
  return { x: validate ? validateValue(x) : x, y: validate ? validateValue(y) : y };
}

/**
 * Construct and return ObjTree based on ObjMap input
 *
 * @param {Map<string, Obj>} [objMap] Map of all objects
 * @return {ObjNode} Root node of constructed objTree
 */
export function constructRootObjTree(objMap: Map<string, Obj>): ObjNode {
  const dependencyMap = new Map<string, string[]>();
  const blank: string[] = [];

  for (const [_, v] of objMap) {
    dependencyMap.set(v.parentId, [...(dependencyMap.get(v.parentId) || blank), v.objId]);
  }

  const root: ObjNode = {
    objId: 'ROOT',
    childNodes: [],
    depth: 0,
  };

  const stack: ObjNode[] = [root];

  while (stack.length > 0) {
    const parent = stack.pop()!;
    const nextIds = dependencyMap.get(parent.objId);
    if (nextIds === undefined) continue;
    for (const id of nextIds) {
      const obj = objMap.get(id);
      if (obj === undefined) continue;
      const child: ObjNode = { objId: id, childNodes: [], depth: obj.depth };
      parent.childNodes.push(child);
      stack.push(child);
    }
    // sort obj by depth
    parent.childNodes.sort(objNodeSorter);
  }

  return root;
}

export function objNodeSorter(a: ObjNode, b: ObjNode) {
  if (a.depth < b.depth) return 1;
  return -1;
}

/**
 * returns number value in provided boundary
 *
 * @param {number} [value] value to bound
 * @param {number} [min] minimum bound
 * @param {number} [max] maximum bound
 * @return {number} bounded value
 */
export function boundNumber(value: number, min: number, max: number): number {
  return Math.max(Math.min(value, max), min);
}

/**
 * validates input obj
 *
 * @param {Obj} [obj] obj to validate
 * @return {Obj} validated obj
 */
export function validateObj(obj: Obj): Obj {
  switch (obj.type) {
    case 'RECT':
      validateRectObj(obj as RectObj);
      break;
    case 'ROOT':
      break;
    case 'TEXT':
      validateTextObj(obj as TextObj);
      break;
  }
  return obj;
}

/**
 * validates input rect obj
 *
 * @param {RectObj} [obj] rect obj to validate
 * @return {Obj} validated obj
 */
function validateRectObj(obj: RectObj): RectObj {
  obj.w = validateValue(obj.w);
  obj.h = validateValue(obj.h);
  obj.x = validateValue(obj.x);
  obj.y = validateValue(obj.y);
  return obj;
}

/**
 * validates input line obj
 *
 * @param {LineObj} [obj] line obj to validate
 * @return {LineObj} validated obj
 */
function validateLineObj(obj: LineObj): LineObj {
  obj.x2 = validateValue(obj.x2);
  obj.y2 = validateValue(obj.y2);
  obj.x = validateValue(obj.x);
  obj.y = validateValue(obj.y);
  return obj;
}

/**
 * validates input text obj
 *
 * @param {TextObj} [obj] text obj to validate
 * @return {TextObj} validated obj
 */
function validateTextObj(obj: TextObj): TextObj {
  obj.w = validateValue(obj.w);
  obj.x = validateValue(obj.x);
  obj.y = validateValue(obj.y);
  return obj;
}

/**
 * validates input value
 *
 * @param {number} [value] number value to validate
 * @param {boolean} [positive=false] the value should be above zero
 * @return {number} validated obj
 */
export function validateValue(value: number, positive = false): number {
  const newValue = Math.round(value);
  if (newValue < 0 && positive) return 0;
  return newValue;
}

interface NodeData {
  id: number;
  label: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface LinkData {
  source: number;
  target: number;
}

export function createForceBundleFromMindmap(response: MindmapResponse): ObjBundle {
  const fontSize = 20;
  const nodeWidth = fontSize * 8;
  const nodeHeight = fontSize * 2;
  const radius = nodeWidth / 2 + 10;
  const edgeWidth = 2;
  const edgeColor = '#31493C';
  const fontColor = '#FFFFFF';
  const nodeColor = '#7A9E7E';
  const bounds = { minX: NaN, maxX: NaN, minY: NaN, maxY: NaN };
  let top = topDepth();
  const unit = 0.0001;
  const result: Obj[] = [];

  const updateBounds = (obj: Obj) => {
    if (isNaN(bounds.minX)) {
      bounds.minX = obj.x;
      bounds.maxX = obj.x;
      bounds.minY = obj.y;
      bounds.maxY = obj.y;
      return;
    }
    bounds.minX = Math.min(bounds.minX, obj.x);
    bounds.maxX = Math.max(bounds.maxX, obj.x);
    if (obj.type === 'TEXT') {
      bounds.maxX = Math.max(bounds.maxX, obj.x + (obj as TextObj).w);
    }
    bounds.minY = Math.min(bounds.minY, obj.y);
    bounds.maxY = Math.max(bounds.maxY, obj.y + fontSize);
  };

  const appendObj = (obj: Obj) => {
    updateBounds(obj);
    result.push(obj);
    top += unit;
  };

  const simulation = forceSimulation<NodeData>();

  const nodes: NodeData[] = [];

  response.keywords.forEach((v, i) => {
    nodes.push({ id: i, label: v });
  });

  const links: any[] = [];

  const graph = new Map<string, number[]>(Object.entries(response.graph));
  for (const entry of graph.entries()) {
    for (const child of entry[1]) {
      links.push({ source: parseInt(entry[0]), target: child });
    }
  }

  simulation
    .nodes(nodes)
    .force(
      'link',
      forceLink<NodeData, LinkData>(links)
        .id((d) => d.id)
        .strength(2)
        .distance(10),
    )
    .force('charge', forceManyBody<NodeData>().strength(-100))
    .force('center', forceCenter(0, 0).strength(1))
    .force('collision', forceCollide(radius))
    .force('radial', forceRadial(0, 0, 100))
    .tick(300);

  for (const link of links) {
    const source = link.source as NodeData;
    const target = link.target as NodeData;
    appendObj(
      createLine(source.x || 0, source.y || 0, target.x || 0, target.y || 0, top, {
        strokeWidth: edgeWidth,
        color: edgeColor,
      }),
    );
  }

  for (const node of nodes) {
    appendObj(
      createRect(
        (node.x ?? 0) - nodeWidth / 2,
        (node.y ?? 0) - nodeHeight / 2,
        nodeWidth,
        nodeHeight,
        nodeColor,
        top,
      ),
    );
    appendObj(
      createText((node.x ?? 0) - nodeWidth / 2, (node.y ?? 0) - fontSize / 2, nodeWidth, top, {
        textAlign: 'center',
        fontSize: fontSize,
        text: node.label,
        color: fontColor,
      }),
    );
  }

  return {
    x: validateValue((bounds.maxX + bounds.minX) / 2),
    y: validateValue((bounds.maxY + bounds.minY) / 2),
    w: bounds.maxX - bounds.minX,
    h: bounds.maxY - bounds.minY,
    objs: result,
  };
}

// DAGRE.js tree version
//
// export function createTreeBundleFromMindmap(response: MindmapResponse): ObjBundle {
//   const fontSize = 20;
//   const bounds = { minX: NaN, maxX: NaN, minY: NaN, maxY: NaN };
//   let top = topDepth();
//   const unit = 0.0001;
//   const result: Obj[] = [];

//   const updateBounds = (obj: Obj) => {
//     if (isNaN(bounds.minX)) {
//       bounds.minX = obj.x;
//       bounds.maxX = obj.x;
//       bounds.minY = obj.y;
//       bounds.maxY = obj.y;
//       return;
//     }
//     bounds.minX = Math.min(bounds.minX, obj.x);
//     bounds.maxX = Math.max(bounds.maxX, obj.x);
//     if (obj.type === 'TEXT') {
//       bounds.maxX = Math.max(bounds.maxX, obj.x + (obj as TextObj).w);
//     }
//     bounds.minY = Math.min(bounds.minY, obj.y);
//     bounds.maxY = Math.max(bounds.maxY, obj.y + fontSize);
//   };

//   const appendObj = (obj: Obj) => {
//     updateBounds(obj);
//     result.push(obj);
//     top += unit;
//   };

//   const g = new graphlib.Graph()
//     .setGraph({
//       rankdir: 'LR',
//       edgesep: 100,
//       ranksep: 50,
//       nodesep: 30,
//     })
//     .setDefaultEdgeLabel(() => ({}));

//   response.keywords.forEach((v, i) => {
//     g.setNode(i.toString(), { label: v, width: fontSize * v.length, height: 30 });
//   });

//   const graph = new Map<string, number[]>(Object.entries(response.graph));
//   for (const entry of graph.entries()) {
//     for (const child of entry[1]) {
//       g.setEdge(entry[0].toString(), child.toString());
//     }
//   }

//   dagre.layout(g);

//   g.edges().forEach((v) => {
//     const edge = g.edge(v);
//     for (let i = 1; i < edge.points.length; i++) {
//       appendObj(
//         createLine(
//           edge.points[i].x,
//           edge.points[i].y,
//           edge.points[i - 1].x,
//           edge.points[i - 1].y,
//           top,
//         ),
//       );
//     }
//   });

//   g.nodes().forEach((v) => {
//     const node = g.node(v);
//     appendObj(
//       createText(node.x - node.width / 2, node.y - node.height / 2, node.width, top, {
//         fontSize: fontSize,
//         textAlign: 'center',
//         color: 'black',
//         text: node.label,
//       }),
//     );
//   });

//   const output = g.graph();
//   if (output.width === undefined || output.height === undefined)
//     throw new Error('그래프 생성에 실패하였습니다.');

//   return {
//     x: output.width / 2,
//     y: output.height / 2,
//     w: output.width,
//     h: output.height,
//     objs: result,
//   };
// }

export function translateObj(obj: Obj, offset: Coord): Obj {
  switch (obj.type) {
    case 'LINE':
      (obj as LineObj).x2 = validateValue((obj as LineObj).x2 + offset.x);
      (obj as LineObj).y2 = validateValue((obj as LineObj).y2 + offset.y);
    case 'RECT':
    case 'TEXT':
      obj.x = validateValue(obj.x + offset.x);
      obj.y = validateValue(obj.y + offset.y);
  }
  return obj;
}

export const lipsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pulvinar, nulla quis viverra venenatis, metus sapien blandit urna, nec tristique sem justo non justo. Pellentesque semper massa nec dapibus luctus. Vestibulum facilisis ornare augue vel semper. Pellentesque id faucibus augue. Quisque ullamcorper tempor magna eget molestie. Etiam mattis a velit quis porttitor. Sed et posuere sapien, non convallis elit. Mauris tempor, metus non auctor accumsan, ante lacus posuere augue, ac scelerisque sem nunc luctus arcu. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus sed dapibus risus, non tristique mi. Quisque vel euismod tellus. Pellentesque sit amet porttitor massa. Maecenas erat mi, eleifend a eleifend non, malesuada eget purus. Mauris ac enim lobortis nulla consequat elementum. Donec imperdiet, metus sed auctor bibendum, eros nulla blandit purus, vel convallis odio nulla id dui. Ut condimentum diam ut turpis tempus, a rhoncus arcu convallis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec lacinia elementum ex vitae vestibulum. Sed id est ultricies neque fermentum hendrerit. Duis molestie velit id eleifend ornare.
Etiam augue metus, venenatis eget facilisis ut, ornare ut elit. Morbi in sodales velit, in sollicitudin ligula. Donec ac ex pulvinar dolor elementum eleifend. Suspendisse eget tempus arcu. Quisque id vestibulum magna, ac sodales purus. Integer pulvinar lectus pulvinar, aliquet ipsum vel, iaculis nisl. Quisque maximus diam quis eros eleifend commodo.
Fusce molestie metus a nulla blandit bibendum. Aliquam at nunc non metus condimentum mollis. Ut elementum justo aliquet nibh mollis, a interdum urna iaculis. Fusce tempus nisi tristique urna laoreet, id facilisis nibh fermentum. Integer quis massa dolor. Mauris imperdiet mattis odio, eget fermentum turpis mattis nec. Mauris aliquet est mi, vel posuere sem accumsan id. Sed rutrum, magna sed feugiat faucibus, ante ante placerat erat, at dapibus lorem est eget nulla. Aenean id scelerisque lorem, eu tristique dui. Nam ornare est ac velit dictum vulputate quis at ex. Curabitur nec massa vel purus luctus ullamcorper eu in orci. In nec rhoncus tellus.
Pellentesque ac blandit sem. Aliquam sed fringilla lorem. Nulla sollicitudin massa ac auctor condimentum. Morbi velit magna, hendrerit id enim sit amet, malesuada ornare eros. Vestibulum laoreet diam ac leo hendrerit placerat. Nulla nec sem et eros posuere fermentum nec a purus. Donec elementum, sem quis auctor commodo, purus nibh lacinia justo, sed porttitor est elit non nulla. Etiam cursus dolor sit amet sem ornare tristique. Nam nisl sem, porttitor blandit dui sed, auctor luctus erat. Etiam nec aliquet diam. Proin tristique erat vitae nisi vestibulum dapibus in sed ligula. Praesent efficitur tellus et arcu fermentum, ut convallis augue interdum. In blandit orci sed nisl pharetra placerat. Sed consequat metus non nisl congue efficitur. Duis et vulputate ante.
Proin mollis erat ut sem posuere luctus. Mauris consectetur ligula nibh, non dignissim arcu convallis quis. Maecenas sollicitudin porttitor massa eu faucibus. Aenean fermentum facilisis lobortis. Integer feugiat augue ut nulla eleifend ornare. Vestibulum non condimentum nisl, pharetra fermentum sem. Mauris nec ante felis. Nam pharetra lobortis nunc, at gravida est placerat vitae.
In scelerisque vitae tortor id convallis. Proin sit amet dui eget est dictum volutpat. Quisque diam metus, condimentum sed sem in, elementum feugiat tellus. Aenean nec magna a leo congue bibendum et at nulla. Nam non feugiat neque. Sed in bibendum elit. Ut venenatis, sapien quis interdum blandit, arcu ante tempor tellus, ut sollicitudin nulla mi a orci. Interdum et malesuada fames ac ante ipsum primis in faucibus.
Praesent sit amet libero gravida, hendrerit lorem ut, laoreet leo. Quisque vitae fermentum est, eu lobortis ante. In et venenatis eros. Curabitur vitae bibendum velit. Donec ut massa mauris. Praesent non mi et erat aliquam volutpat. Duis at commodo justo. Aenean porta malesuada velit.
Quisque vitae diam ac mauris posuere egestas et id quam. Pellentesque et egestas ante. Etiam vel faucibus orci, non pellentesque ex. Maecenas nec tincidunt odio, at tincidunt lectus. Morbi ligula tortor, volutpat id magna et, scelerisque mattis augue. Suspendisse elementum ac libero vitae venenatis. Aliquam erat volutpat. Aliquam convallis purus nec velit faucibus, at porta tellus ultrices. Phasellus suscipit lectus vel sapien rutrum cursus id non odio. Curabitur eget ex rhoncus, mattis erat non, feugiat ex. Donec id lacus et tortor accumsan sollicitudin in sit amet tellus.
Proin lacinia placerat elit at pretium. Donec efficitur tortor id ex placerat, eget malesuada dolor egestas. Nullam bibendum mollis lacus nec condimentum. Morbi lacinia eget nisl sit amet laoreet. Duis consequat mattis nisl, at luctus eros porttitor ut. Nullam bibendum enim vitae est lacinia, faucibus dapibus diam tempor. Duis nec arcu a mi mollis efficitur. Aliquam non laoreet quam. Vivamus ipsum nunc, semper ultricies nisi sit amet, pellentesque tincidunt enim. Donec ultricies urna congue orci dictum, sed elementum neque hendrerit. Cras vel tempus mauris, vitae consectetur magna. Morbi vel rutrum quam, sed blandit ligula.
Quisque commodo, enim et gravida venenatis, erat neque laoreet eros, sed sollicitudin justo ante malesuada magna. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce velit est, hendrerit sed orci ac, luctus eleifend quam. Nam a tincidunt urna, ut ultricies massa. Donec semper purus aliquam, venenatis magna eu, gravida nunc. Proin luctus pulvinar hendrerit. Proin lorem tellus, blandit blandit orci nec, euismod hendrerit velit. Sed aliquam lacus ac justo fermentum aliquam in quis ante.
In hac habitasse platea dictumst. Nullam non nunc metus. Sed vitae felis ligula. Nullam scelerisque placerat mauris in laoreet. Maecenas pulvinar, lectus sed maximus iaculis, dolor neque tempus metus, non commodo nibh nibh eleifend orci. Suspendisse potenti. Nam volutpat efficitur nisl, vel vestibulum ligula pulvinar sed. Maecenas id tellus non ipsum aliquam imperdiet. Aenean vulputate, ante nec egestas fermentum, lacus libero scelerisque risus, non maximus leo metus at lorem. Phasellus sodales lacinia arcu, id pretium urna mattis in. Aliquam at fringilla tortor. Quisque bibendum neque ac augue ultricies consequat. Duis massa elit, interdum at tincidunt a, fermentum et justo. Sed sit amet porta sem.
In aliquet euismod euismod. Donec lacinia id ligula quis mattis. Cras placerat tempus nulla, vitae auctor ex sodales ut. Fusce lorem diam, dapibus eu tempus nec, vestibulum eget eros. Nullam interdum tincidunt justo, egestas blandit mi venenatis eget. Etiam nec sem rutrum felis pharetra posuere. Fusce quis porttitor elit. Aliquam imperdiet est sed nibh egestas, commodo efficitur magna varius. Vivamus laoreet ex ac purus viverra rutrum. Fusce pharetra enim sed porttitor efficitur. Aliquam lobortis cursus vehicula. Nunc gravida libero sit amet convallis malesuada. Vestibulum sit amet nunc sit amet justo ullamcorper consectetur non sit amet arcu. Pellentesque suscipit metus a dignissim commodo. In hac habitasse platea dictumst.
Maecenas venenatis porta aliquam. Pellentesque sit amet leo dignissim, eleifend ex sit amet, efficitur massa. Nunc eu pellentesque sapien. Nam ac dui nibh. Integer quis sollicitudin quam. Donec elementum nisi sit amet magna sollicitudin fringilla. Pellentesque viverra nulla nec lectus volutpat sodales. Nam viverra molestie ante at venenatis. Cras nec sagittis purus, facilisis pretium est. Sed sapien ante, sagittis vel orci a, euismod rutrum nunc. Integer efficitur neque eu dictum condimentum. Donec quis ligula id metus bibendum vulputate sit amet vel augue. Integer placerat vitae metus dignissim varius. Nullam bibendum quam non consectetur ornare. Curabitur sed venenatis nunc.
Proin dui massa, gravida eget egestas et, hendrerit fermentum arcu. Nam a bibendum lacus, sed pharetra lacus. Sed quis velit mollis, fringilla tellus non, semper ex. Quisque sodales feugiat dui a ultricies. Proin mattis elementum ante, eget porta purus. Sed congue erat non quam congue facilisis. Suspendisse finibus urna dolor, id vestibulum quam interdum nec. Duis non tempor elit, sit amet aliquet nisi. Nam porttitor tempus felis, ultrices vestibulum diam. Aliquam mollis lectus in leo sagittis rhoncus. Praesent eu imperdiet elit, vel faucibus erat. In ac consequat purus. Nullam in maximus turpis.
Donec arcu orci, blandit sit amet libero in, tristique pellentesque purus. Duis ornare turpis lacus, sed interdum erat accumsan in. Nullam erat tellus, tincidunt eget ultrices ut, laoreet eget elit. Mauris velit ligula, egestas eu ligula non, pharetra feugiat urna. Aenean ut nisl mi. Aliquam erat volutpat. Nunc id laoreet tellus, id iaculis ipsum. Mauris facilisis sed risus nec scelerisque. Proin tellus arcu, congue in urna at, tristique porta orci. Nullam ut dolor in leo dapibus consectetur. Nam porta sem non est eleifend molestie. Nunc tempor massa nisl, et mollis orci congue quis. Donec mollis, quam quis gravida iaculis, nunc diam consectetur felis, eu tristique lorem eros rutrum elit. Etiam nec dolor pellentesque, faucibus mauris nec, blandit est.
Quisque dignissim risus quis diam dignissim condimentum. Suspendisse nec sapien non lacus pellentesque feugiat. Praesent sodales sem sapien, quis viverra nisl viverra vitae. Fusce a ligula hendrerit, consequat odio sit amet, bibendum neque. Maecenas erat augue, tincidunt eget rutrum id, tristique ut turpis. Curabitur cursus sagittis mi et mollis. Maecenas faucibus gravida quam, dictum sagittis quam fermentum nec. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In quis nibh erat. Curabitur efficitur facilisis facilisis. Sed dictum id nisl vitae consequat.
In volutpat erat vel eros hendrerit rutrum. Phasellus posuere a urna at feugiat. Duis nec lacus ut magna hendrerit finibus. Maecenas varius pellentesque est, ornare pulvinar augue ultricies sed. Morbi lacinia efficitur sem et cursus. Curabitur id fermentum erat. Sed vehicula euismod tortor, sed mollis arcu vestibulum in. Mauris ante mi, convallis egestas justo eget, placerat pellentesque justo. Sed tincidunt dapibus feugiat. Vivamus a urna tristique, imperdiet quam iaculis, feugiat erat. Mauris quis orci et eros tincidunt ultricies. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer pretium interdum tellus, vel dictum mauris venenatis id.
Nam at augue ut risus luctus tempus. Nam facilisis posuere consectetur. Curabitur neque augue, ultrices ut imperdiet a, gravida at tellus. Aenean lorem elit, finibus non est pellentesque, dictum maximus purus. In luctus venenatis convallis. Fusce nunc velit, vehicula sit amet ex vitae, interdum ornare nisl. Vestibulum quis ipsum non urna bibendum finibus. Sed cursus, libero eget bibendum tristique, purus elit fringilla magna, eu faucibus lorem ipsum at sem. Maecenas sed arcu quam.
Sed non ultricies magna. Nunc eget commodo risus. Nullam eu nibh elit. Nunc tempus mauris eget ante hendrerit malesuada. Quisque nec est vitae arcu rutrum convallis ac sit amet ligula. Quisque eget efficitur neque. Sed consectetur auctor fringilla. Nullam ultrices ornare ante id posuere.`;
