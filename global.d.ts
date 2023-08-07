interface ObjNode {
  objId: string;
  childNodes: ObjNode[];
}

interface Obj {
  objId: string;
  type: 'RECT' | 'TEXT' | 'ROOT';
  x: number;
  y: number;
  depth: number;
  parentId: string;
}

interface RectObj extends Obj {
  w: number;
  h: number;
  color: string;
}

type OverflowType = 'normal' | 'break-word';
interface TextObj extends Obj {
  w: number;
  fontSize: number;
  overflow: OverflowType;
  text: string;
  color: string;
}

interface Coord {
  x: number;
  y: number;
}

type Tool = 'HAND' | 'SELECT' | 'RECT' | 'TEXT';

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
