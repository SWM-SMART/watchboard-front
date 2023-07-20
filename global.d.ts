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

interface Document extends DocumentMetadata {
  document_data: Map<string, Obj>;
}

export type DocumentListReponse = DocumentMetaData[];

export type DocumentReponse = Document;

export type DocumentCreateResponse = DocumentMetadata;
