import { constructRootObjTree } from '@/utils/whiteboardHelper';
import { create } from 'zustand';

interface WhiteBoardState {
  objMap: Map<string, Obj>;
  objTree: ObjNode;
  currentTool: Tool;
  currentObj: string | null;
  drag: DragData | null;
}

interface WhiteBoardActions {
  addObj: (obj: Obj) => void;
  updateObj: (obj: Obj) => void;
  setCurrentTool: (tool: Tool) => void;
  setCurrentObj: (obj: string | null) => void;
  setDrag: (drag: DragData | null) => void;
  loadDocument: (document: WBDocument) => void;
  resetWhiteBoard: () => void;
}

const ROOT_OBJ = {
  objId: 'root',
  childNodes: [],
  depth: 0,
} as ObjNode;

const initialState = {
  objMap: new Map<string, Obj>(),
  objTree: ROOT_OBJ,
  currentTool: 'SELECT',
  currentObj: null,
  drag: null,
} as WhiteBoardState;

export const useWhiteBoard = create<WhiteBoardState & WhiteBoardActions>()((set) => ({
  ...initialState,
  addObj: (obj: Obj) =>
    set((state) => ({
      objMap: state.objMap.set(obj.objId, obj),
      objTree: {
        ...state.objTree,
        childNodes: [
          { objId: obj.objId, childNodes: [], depth: obj.depth },
          ...state.objTree.childNodes,
        ],
      },
      currentObj: obj.objId,
    })),
  updateObj: (obj: Obj) => set((state) => ({ objMap: state.objMap.set(obj.objId, obj) })),
  setCurrentTool: (tool: Tool) => set(() => ({ currentTool: tool })),
  setCurrentObj: (obj: string | null) => set(() => ({ currentObj: obj })),
  setDrag: (drag: DragData | null) => set(() => ({ drag: drag })),
  loadDocument: async (document: WBDocument) => {
    const newObjMap = new Map<string, Obj>(Object.entries(document.documentData));
    const newObjTree = constructRootObjTree(newObjMap);
    set(() => ({ objMap: newObjMap, objTree: newObjTree }));
  },
  resetWhiteBoard: () => set(() => ({ ...initialState })),
}));
