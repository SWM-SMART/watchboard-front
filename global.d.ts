interface ObjNode {
  objId: string;
  childNodes: ObjNode[];
}

interface Obj {
  objId: string;
  type: 'RECT' | 'TEXT';
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

interface TextObj extends Obj {
  w: number;
  fontSize: number;
  overflow: 'normal' | 'break-word';
  text: string;
  color: string;
}

interface Coord {
  x: number;
  y: number;
}

type Tool = 'HAND' | 'SELECT' | 'RECT' | 'TEXT';

interface DocumentMetadata {
  document_id: number;
  document_name: string;
  created_at: Date;
  modified_at: Date;
}

type DocumentData = Map<string, Obj>;

interface Document extends DocumentMetadata {
  document_data: DocumentData;
}

type DocumentListReponse = DocumentMetaData[];

type DocumentReponse = Document;

type DocumentCreateResponse = DocumentMetadata;
