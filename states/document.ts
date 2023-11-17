import { deleteDocument, getDocumentList } from '@/utils/api';
import { create } from 'zustand';

interface DocumentState {
  documentList?: WBDocument[];
  fetchDocumentList: (demo?: boolean) => void;
  deleteDocument: (documentId: number) => void;
}

export const useDocument = create<DocumentState>()((set, get) => ({
  documentList: [],
  fetchDocumentList: async (demo) => {
    console.log(demo);
    const newList = (await getDocumentList(demo)) as WBDocument[];
    set(() => ({ documentList: newList }));
  },
  deleteDocument: async (documentId: number) => {
    const res = await deleteDocument(documentId);
    if (res !== 200) return;
    set({ documentList: get().documentList?.filter((v) => v.documentId !== documentId) });
  },
}));
