interface ObjNode {
  objId: string;
  childNodes: ObjNode[];
}

interface Obj {
  objId: string;
  type: "RECT" | "TEXT";
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
  overflow: "normal" | "break-word";
  text: string;
  color: string;
}

interface Coord {
  x: number;
  y: number;
}

interface Document {
  documentId: string;
  objects;
}

type Tool = "HAND" | "SELECT" | "RECT" | "TEXT";
