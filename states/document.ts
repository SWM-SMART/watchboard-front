import { getDocumentList } from '@/utils/api';
import { create } from 'zustand';

interface DocumentState {
  documentList: WBDocumentMetadata[];
  fetchDocumentList: () => void;
}

export const useDocument = create<DocumentState>()((set) => ({
  documentList: [],
  fetchDocumentList: async () => {
    const newList = (await getDocumentList()) as WBDocumentMetadata[];
    set(() => ({ documentList: newList }));
  },
}));
