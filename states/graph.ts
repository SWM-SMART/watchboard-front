import { create } from 'zustand';

interface GraphState {
  selected?: NodeData;
  setSelected: (selected: NodeData | undefined) => void;
}

export const useGraph = create<GraphState>((set) => ({
  selected: undefined,
  setSelected: (selected) => set({ selected: selected }),
}));
