import { constructRootObjTree, objNodeSorter, translateObj } from '@/utils/whiteboardHelper';
import { create } from 'zustand';

interface ViewerState {
  view: ViewerPage;
  document: WBDocument | null;
  selectedNode?: NodeData;
  searchQuery: string;
  focusNodeCallback: ((node: NodeData) => void) | undefined;
  keywords: Map<string, boolean>;
  dataStr: string[][];
  focusKeywordCallback: ((keyword: string, location: number[]) => void) | undefined;
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
  setAllKeyword: (state: boolean) => void;
  setDataStr: (dataStr: string[][]) => void;
  findDataStr: (from: number[], keyword: string) => KeywordSourceResult | undefined;
  setFocusKeywordCallback: (
    callback: ((keyword: string, location: number[]) => void) | undefined,
  ) => void;
}

const initialState = {
  selectedNode: undefined,
  view: 'HOME',
  document: null,
  searchQuery: '',
  focusNodeCallback: undefined,
  keywords: new Map<string, boolean>(),
  dataStr: [],
  focusKeywordCallback: undefined,
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
  setAllKeyword: (state) => {
    const keywords = get().keywords;
    for (const k of keywords.keys()) {
      keywords.set(k, state);
    }
    set({ keywords });
  },
  setDataStr: (dataStr) => set({ dataStr }),
  findDataStr: (from, keyword) => {
    let [ib, jb] = from;
    const data = get().dataStr;
    for (let i = ib; i < data.length; i++) {
      const strs = data[i];
      for (let j = jb + 1; j < strs.length; j++) {
        const str = strs[j];
        const index = str.indexOf(keyword);
        if (index > -1) {
          // match
          return {
            str: str,
            keyword: keyword,
            index: index,
            location: [i, j],
          };
        }
      }
      jb = 0;
    }
    // no match
    return undefined;
  },
  setFocusKeywordCallback: (callback) => set({ focusKeywordCallback: callback }),
}));
