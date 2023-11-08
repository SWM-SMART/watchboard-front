interface ObjNode {
  objId: string;
  childNodes: ObjNode[];
  depth: number;
}

type ObjType =
  | 'RECT'
  | 'TEXT'
  | 'ROOT'
  | 'LINE'
  | 'CIRCLE'
  | 'GRAPHROOT'
  | 'LIVEGRAPH'
  | 'GRAPHNODE';

interface Obj {
  objId: string;
  type: ObjType;
  x: number;
  y: number;
  depth: number;
  parentId: string;
}

interface ObjDimensions {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface LiveGraphObj extends Obj {
  type: 'LIVEGRAPH';
  data: GraphData;
}

interface GraphNodeObj extends Obj {
  type: 'GRAPHNODE';
  label: string;
}

interface GraphRootObj extends GraphNodeObj {
  type: 'GRAPHROOT';
}

interface CircleObj extends Obj {
  type: 'CIRCLE';
  r: number;
  color: string;
}

interface CircleOptions {
  color?: string;
}

type ViewerPage = 'HOME' | 'DATA' | 'LOAD';

interface ThreeGraphData {
  nodes: NodeDataLegacy[];
  links: LinkDataLegacy[];
}

type ExtendedSpriteText = import('three-spritetext').default & {
  initialScale: { x: number; y: number };
};

interface NodeData {
  children: NodeData[];
  parent?: NodeData;
  id: number;
  label: string;
  labelMesh?: ExtendedSpriteText;
  scale: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  vx?: number;
  vy?: number;
}

interface NodeDataLegacy {
  id: string;
  name: string;
  val: number;
  color: string;
  r: number;
  __threeObj?: Mesh;
}

interface LinkData {
  source: number | NodeData;
  target: number | NodeData;
}

interface LinkDataLegacy {
  source: string;
  target: string;
  color: string;
}

interface RectObj extends Obj {
  type: 'RECT';
  w: number;
  h: number;
  color: string;
}

type OverflowType = 'normal' | 'break-word';
type TextAlgin = 'center' | 'left' | 'right';
interface TextObj extends Obj {
  type: 'TEXT';
  w: number;
  fontSize: number;
  overflow: OverflowType;
  text: string;
  color: string;
  textAlign: TextAlgin;
}

interface TextOptions {
  fontSize?: number;
  overflow?: OverflowType;
  textAlign?: TextAlgin;
  text?: string;
  color?: string;
}

interface LineObj extends Obj {
  type: 'LINE';
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
}

interface LineOptions {
  color?: string;
  strokeWidth?: number;
}

interface Coord {
  x: number;
  y: number;
}

type Tool = 'HAND' | 'SELECT' | 'RECT' | 'TEXT' | 'LINE' | 'BUNDLE' | 'CIRCLE' | 'HIGHLIGHT';

interface WBDocument {
  documentId: number;
  documentName: string;
  dataType: WBSourceDataType;
  createdAt: number;
  modifiedAt: number;
}

type WBDocumentData = Map<string, Obj>;

type WBDocumentListReponse = WBDocumentMetaData[];

type WBDocumentReponse = WBDocument;

type WBDocumentCreateResponse = WBDocument;
interface UserData {
  userId: number;
  nickname: string;
  email: string;
}

type UserDataResponse = UserData;

interface ToastData {
  id: number;
  duraton: number;
  msg: string;
}

type DragData = { mousePos: Coord; mode: DragMode; prevObj: Obj };
type DragMode = 'move' | 'n' | 'e' | 'w' | 's' | 'ne' | 'nw' | 'sw' | 'se';

interface TextRequest {
  text: string;
}

interface GraphData {
  root: number;
  keywords: string[];
  graph: Map<string, number[]>;
}

type WBSourceDataType = 'pdf' | 'audio' | 'none';

interface WBSourceData {
  url: string;
}

type WBSourcePdfData = WBSourceData;

interface WBSourceAudioData extends WBSourceData {
  data: SpeechData[];
}

interface SpeechData {
  start: number;
  end: number;
  text: string;
}

interface ObjBundle {
  x: number;
  y: number;
  w: number;
  h: number;
  objs: Obj[];
}

interface KeywordSourceResult {
  str: string;
  keyword: string;
  location: number[];
}

type KeywordType = 'ADD' | 'STABLE' | 'DELETE';
interface KeywordState {
  enabled: boolean;
  type: KeywordType;
}

interface KeywordResponse {
  text: string;
}

type ViewerEventType = 'create' | 'reload';
