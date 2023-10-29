import { getDocumentList } from '@/utils/api';
import { create } from 'zustand';

interface DocumentState {
  documentList: WBDocument[];
  fetchDocumentList: () => void;
}

export const useDocument = create<DocumentState>()((set) => ({
  documentList: [],
  fetchDocumentList: async () => {
    const newList = (await getDocumentList()) as WBDocument[];
    set(() => ({ documentList: newList }));
  },
}));
