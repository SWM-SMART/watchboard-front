import { atom } from 'recoil';

export const documentListState = atom<WBDocumentMetadata[]>({
  key: 'document-list',
  default: [],
});
