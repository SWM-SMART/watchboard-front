import { rest } from 'msw';
import { API_BASE_URL } from '../utils/api';

let documents: WBDocumentMetadata[] = [
  {
    document_id: 0,
    document_name: 'document0',
    created_at: new Date('2023-07-20T04:49:46.901Z').getTime(),
    modified_at: new Date('2023-07-20T04:49:46.901Z').getTime(),
  },
  {
    document_id: 1,
    document_name: 'document1',
    created_at: new Date('2023-07-19T04:49:46.901Z').getTime(),
    modified_at: new Date('2023-07-20T04:49:46.901Z').getTime(),
  },
  {
    document_id: 2,
    document_name: 'document2',
    created_at: new Date('2023-07-21T04:49:46.901Z').getTime(),
    modified_at: new Date('2023-07-22T04:49:46.901Z').getTime(),
  },
];

const documentData: WBDocumentData = new Map([
  [
    'a',
    {
      objId: 'a',
      type: 'RECT',
      x: 10,
      y: 10,
      depth: 0.0001,
      parentId: 'ROOT',
      w: 100,
      h: 100,
      color: 'rgb(121, 75, 150)',
    },
  ],
  [
    'b',
    {
      objId: 'b',
      type: 'RECT',
      x: -10,
      y: -10,
      depth: 0.0002,
      parentId: 'ROOT',
      w: 100,
      h: 100,
      color: 'rgb(20, 200, 100)',
    },
  ],
  [
    'c',
    {
      objId: 'c',
      type: 'TEXT',
      x: 0,
      y: 0,
      depth: 0.0003,
      parentId: 'ROOT',
      w: 100,
      fontSize: 5,
      overflow: 'normal',
      text: 'lorem ipsum',
      color: 'rgb(121, 75, 150)',
    },
  ],
]);

const createDocument = (document_name: string) => {
  const date = new Date().getTime();
  const newDocument: WBDocumentMetadata = {
    document_id: documents.length + 1,
    document_name: document_name,
    created_at: date,
    modified_at: date,
  };
  documents.push(newDocument);
  return newDocument;
};

const getDocument = (documentID: number): undefined | WBDocument => {
  for (let document of documents) {
    if (document.document_id === documentID) return { ...document, document_data: documentData };
  }
  return undefined;
};

const deleteDocument = (documentID: number): void => {
  documents = documents.filter((v) => {
    v.document_id === documentID;
  });
};

export const handlers = [
  rest.get(`${API_BASE_URL}/documents`, (_, res, ctx) => {
    return res(ctx.json(documents));
  }),
  rest.post(`${API_BASE_URL}/documents`, async (req, res, ctx) => {
    return res(ctx.json(createDocument((await req.json()).document_name)));
  }),
  rest.get(`${API_BASE_URL}/documents/:documentID`, (req, res, ctx) => {
    return res(ctx.json(getDocument(parseInt(req.params.documentID as string))));
  }),
  rest.delete(`${API_BASE_URL}/documents/:documentID`, (req, res, ctx) => {
    deleteDocument(parseInt(req.params.documentID as string));
    return res(ctx.status(200));
  }),
];
