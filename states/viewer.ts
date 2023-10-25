import { constructRootObjTree, objNodeSorter, translateObj } from '@/utils/whiteboardHelper';
import { create } from 'zustand';

interface ViewerState {
  view: ViewerPage;
  document: WBDocument | null;
  selectedNode?: NodeData;
  searchQuery: string;
  focusNodeCallback: ((node: NodeData) => void) | undefined;
  keywords: Map<string, boolean>;
}

interface ViewerActions {
  setView: (view: ViewerPage) => void;
  setDocument: (document: WBDocument) => void;
  reset: () => void;
  setSelectedNode: (node?: NodeData) => void;
  setSearchQuery: (query: string) => void;
  setFocusNodeCallback: (callback: ((node: NodeData) => void) | undefined) => void;
  addKeyword: (keyword: string, state?: boolean) => void;
  deleteKeyword: (keyword: string) => void;
  setKeyword: (keyword: string, state: boolean) => void;
  singleOutKeyword: (keyword: string) => void;
  setAllKeyword: (state: boolean) => void;
}

const initialState = {
  selectedNode: undefined,
  view: 'HOME',
  document: null,
  searchQuery: '',
  focusNodeCallback: undefined,
  keywords: new Map<string, boolean>(),
} as ViewerState;

export const useViewer = create<ViewerState & ViewerActions>()((set, get) => ({
  ...initialState,
  setView: (view) => {
    set({ view });
  },
  setDocument: (document) => {
    set({ document });
  },
  reset: () => {
    set(initialState);
  },
  setSelectedNode: (node) => set({ selectedNode: node }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFocusNodeCallback: (callback) => set({ focusNodeCallback: callback }),
  addKeyword: (keyword, state) =>
    set({ keywords: new Map([...get().keywords, [keyword, state === true]]) }),
  deleteKeyword: (keyword) => {
    const newMap = new Map([...get().keywords]);
    newMap.delete(keyword);
    set({ keywords: newMap });
  },
  setKeyword: (keyword, state) => {
    set({ keywords: new Map([...get().keywords]).set(keyword, state) });
  },
  singleOutKeyword: (keyword) => {},
  setAllKeyword: (state) => {},
}));
