import { getDataSource, getDocument, getMindMapData } from '@/utils/api';
import { create } from 'zustand';

interface ViewerState {
  dataSource: WBSourceData | null;
  mindMapData: GraphData | null;
  nextState: ViewerStateSlice | null;
  view: ViewerPage;
  document: WBDocument | null;
  selectedNode?: NodeData;
  searchQuery: string;
  focusNodeCallback: ((node: NodeData) => void) | undefined;
  keywords: Map<string, KeywordState>;
  dataStr: string[][];
  focusKeywordCallback: ((keyword: string, location: number[]) => void) | undefined;
  currentTool: Tool;
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
  setKeyword: (keyword: string, state: KeywordState) => void;
  setAllKeyword: (state: boolean) => void;
  setDataStr: (dataStr: string[][]) => void;
  findDataStr: (from: number[], keyword: string) => KeywordSourceResult | undefined;
  setFocusKeywordCallback: (
    callback: ((keyword: string, location: number[]) => void) | undefined,
  ) => void;
  loadDocument: (documentId: number) => void;
  setCurrentTool: (tool: Tool) => void;
  syncDocument: () => void;
  applySyncDocument: () => void;
  clearSyncDocument: () => void;
}

interface ViewerStateSlice {
  dataSource?: WBSourceData;
  mindMapData?: GraphData;
  document?: WBDocument;
}

const initialState = {
  dataSource: null,
  mindMapData: null,
  selectedNode: undefined,
  view: 'HOME',
  document: null,
  searchQuery: '',
  focusNodeCallback: undefined,
  keywords: new Map<string, KeywordState>(),
  dataStr: [],
  focusKeywordCallback: undefined,
  currentTool: 'SELECT',
  nextState: null,
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
    set({
      keywords: new Map([...get().keywords, [keyword, { type: 'ADD', enabled: state === true }]]),
    }),
  deleteKeyword: (keyword) => {
    const keywords = get().keywords;
    const newKeywords = new Map([...keywords]);
    newKeywords.delete(keyword);
    set({
      keywords: newKeywords,
    });
  },
  setKeyword: (keyword, state) => {
    const keywords = get().keywords;
    const prevState = keywords.get(keyword);
    if (prevState === undefined) return;
    set({
      keywords: new Map([...keywords]).set(keyword, { ...state }),
    });
  },
  setAllKeyword: (state) => {
    const keywords = get().keywords;
    for (const [k, v] of keywords.entries()) {
      keywords.set(k, { ...v, enabled: state });
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
      jb = -1;
    }
    // no match
    return undefined;
  },
  setFocusKeywordCallback: (callback) => set({ focusKeywordCallback: callback }),
  loadDocument: async (documentId) => {
    // fetch document
    const newDocument = await getDocument(documentId);
    // fetch sourceData
    const newDataSource = await getDataSource(documentId, newDocument.dataType);
    // fetch mindMapData
    const newMindMapData = await getMindMapData(documentId);

    // local keyword map
    const newKeywords = new Map<string, KeywordState>();
    for (const keyword of newMindMapData.keywords) {
      newKeywords.set(keyword, {
        enabled: false,
        type: 'STABLE',
      });
    }

    set({
      document: newDocument,
      dataSource: newDataSource,
      mindMapData: newMindMapData,
      keywords: newKeywords,
    });
  },
  setCurrentTool: (tool) => {
    set({ currentTool: tool });
  },
  syncDocument: async () => {
    // same as loadDocument, but stages new state before applying and compares it with the previous state
    const document = get().document;
    const nextState: ViewerStateSlice = {};
    if (document === null) return;
    // fetch documentMetaData
    const newDocumentData = await getDocument(document.documentId);
    // fetch mindMapData: always update
    nextState.mindMapData = await getMindMapData(document.documentId);

    // fetch datasource: update only if datasource has changed
    const newDataSource = await getDataSource(document.documentId, newDocumentData.dataType);
    if (newDataSource.url !== get().dataSource?.url) {
      nextState.dataSource = newDataSource;
      nextState.document = newDocumentData;
    }
    set({ nextState: nextState });
  },
  applySyncDocument: () => {
    const newState = get().nextState;
    if (newState === null) return;
    // local keyword map
    const newKeywords = new Map<string, KeywordState>();
    if (newState.mindMapData !== undefined) {
      for (const keyword of newState.mindMapData.keywords) {
        newKeywords.set(keyword, {
          enabled: false,
          type: 'STABLE',
        });
      }
    }
    set({
      selectedNode: undefined,
      keywords: newKeywords,
      nextState: null,
      view: 'HOME',
      ...newState,
    });
  },
  clearSyncDocument: () => {
    set({ nextState: null });
  },
}));
