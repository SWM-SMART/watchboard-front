import DocumentList from '@/app/components/DocumentList';
import { deleteDocument, getDocumentList } from '@/utils/api';
import { create } from 'zustand';

interface DocumentState {
  documentList: WBDocument[];
  fetchDocumentList: () => void;
  deleteDocument: (documentId: number) => void;
}

export const useDocument = create<DocumentState>()((set, get) => ({
  documentList: [],
  fetchDocumentList: async () => {
    const newList = (await getDocumentList()) as WBDocument[];
    set(() => ({ documentList: newList }));
  },
  deleteDocument: async (documentId: number) => {
    const res = await deleteDocument(documentId);
    if (res !== 200) return;
    set({ documentList: get().documentList.filter((v) => v.documentId !== documentId) });
  },
}));
