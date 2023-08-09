import { constructRootObjTree } from '@/utils/whiteboardHelper';
import { create } from 'zustand';

interface WhiteBoardState {
  objMap: Map<string, Obj>;
  objTree: ObjNode;
  addObj: (obj: Obj) => void;
  updateObj: (obj: Obj) => void;
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  currentObj: string | null;
  setCurrentObj: (obj: string | null) => void;
  drag: DragData | null;
  setDrag: (drag: DragData | null) => void;
  loadDocument: (document: WBDocument) => void;
}

const ROOT_OBJ = {
  objId: 'root',
  childNodes: [],
} as ObjNode;

export const useWhiteBoard = create<WhiteBoardState>()((set) => ({
  objMap: new Map<string, Obj>(),
  objTree: ROOT_OBJ,
  addObj: (obj: Obj) =>
    set((state) => ({
      objMap: state.objMap.set(obj.objId, obj),
      objTree: {
        ...state.objTree,
        childNodes: [...state.objTree.childNodes, { objId: obj.objId, childNodes: [] }],
      },
      currentObj: obj.objId,
    })),
  updateObj: (obj: Obj) => set((state) => ({ objMap: state.objMap.set(obj.objId, obj) })),
  currentTool: 'SELECT',
  setCurrentTool: (tool: Tool) => set(() => ({ currentTool: tool })),
  currentObj: null,
  setCurrentObj: (obj: string | null) => set(() => ({ currentObj: obj })),
  drag: null,
  setDrag: (drag: DragData | null) => set(() => ({ drag: drag })),
  loadDocument: async (document: WBDocument) => {
    const newObjMap = new Map<string, Obj>(Object.entries(document.documentData));
    const newObjTree = constructRootObjTree(newObjMap);
    set(() => ({ objMap: newObjMap, objTree: newObjTree }));
  },
}));
