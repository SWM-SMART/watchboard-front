import { getDocumentList } from '@/utils/api';
import { create } from 'zustand';

interface DocumentListState {
  documentList: WBDocumentMetadata[];
  fetchDocumentList: () => void;
}

export const useDocumentList = create<DocumentListState>()((set) => ({
  documentList: [],
  fetchDocumentList: async () => {
    const newList = (await getDocumentList()) as WBDocumentMetadata[];
    set(() => ({ documentList: newList }));
  },
}));
