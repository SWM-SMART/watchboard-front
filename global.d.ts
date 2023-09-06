interface ObjNode {
  objId: string;
  childNodes: ObjNode[];
  depth: number;
}

type ObjType = 'RECT' | 'TEXT' | 'ROOT' | 'LINE' | 'CIRCLE' | 'GRAPH';

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

interface GraphObj extends Obj {
  type: 'GRAPH';
  data: MindmapResponse;
}

interface CircleObj extends Obj {
  type: 'CIRCLE';
  r: number;
  color: string;
}

interface CircleOptions {
  color?: string;
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

type Tool = 'HAND' | 'SELECT' | 'RECT' | 'TEXT' | 'LINE' | 'BUNDLE' | 'CIRCLE';

interface WBDocumentMetadata {
  documentId: number;
  documentName: string;
  createdAt: number;
  modifiedAt: number;
}

type WBDocumentData = Map<string, Obj>;

interface WBDocument extends WBDocumentMetadata {
  documentData: WBDocumentData;
}

type WBDocumentListReponse = WBDocumentMetaData[];

type WBDocumentReponse = WBDocument;

type WBDocumentCreateResponse = WBDocumentMetadata;
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

interface MindmapResponse {
  root: number;
  keywords: string[];
  graph: Map<string, number[]>;
}

interface ObjBundle {
  x: number;
  y: number;
  w: number;
  h: number;
  objs: Obj[];
}
