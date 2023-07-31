import { rest } from 'msw';
import { API_BASE_URL } from '../utils/api';

let documents: WBDocumentMetadata[] = [
  {
    documentId: 0,
    documentName: 'document0',
    createdAt: new Date('2023-07-20T04:49:46.901Z').getTime(),
    modifiedAt: new Date('2023-07-20T04:49:46.901Z').getTime(),
  },
  {
    documentId: 1,
    documentName: 'document1',
    createdAt: new Date('2023-07-19T04:49:46.901Z').getTime(),
    modifiedAt: new Date('2023-07-20T04:49:46.901Z').getTime(),
  },
  {
    documentId: 2,
    documentName: 'document2',
    createdAt: new Date('2023-07-21T04:49:46.901Z').getTime(),
    modifiedAt: new Date('2023-07-22T04:49:46.901Z').getTime(),
  },
];

const documentData: WBDocumentData = new Map([
  [
    '0',
    {
      objId: '0',
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
    '1',
    {
      objId: '1',
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
    '2',
    {
      objId: '2',
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
  [
    '3',
    {
      objId: '3',
      type: 'TEXT',
      x: 0,
      y: 0,
      depth: 0.0003,
      parentId: '1',
      w: 100,
      fontSize: 5,
      overflow: 'normal',
      text: 'lorem ipsum',
      color: 'rgb(121, 75, 150)',
    },
  ],
  [
    '4',
    {
      objId: '4',
      type: 'TEXT',
      x: 0,
      y: 0,
      depth: 0.0003,
      parentId: '2',
      w: 100,
      fontSize: 5,
      overflow: 'normal',
      text: 'lorem ipsum',
      color: 'rgb(121, 75, 150)',
    },
  ],
  [
    '5',
    {
      objId: '5',
      type: 'TEXT',
      x: 0,
      y: 0,
      depth: 0.0003,
      parentId: '6',
      w: 100,
      fontSize: 5,
      overflow: 'normal',
      text: 'lorem ipsum',
      color: 'rgb(121, 75, 150)',
    },
  ],
  [
    '6',
    {
      objId: '6',
      type: 'TEXT',
      x: 0,
      y: 0,
      depth: 0.0003,
      parentId: '2',
      w: 100,
      fontSize: 5,
      overflow: 'normal',
      text: 'lorem ipsum',
      color: 'rgb(121, 75, 150)',
    },
  ],
  [
    '7',
    {
      objId: '7',
      type: 'TEXT',
      x: 0,
      y: 0,
      depth: 0.0003,
      parentId: '1',
      w: 100,
      fontSize: 5,
      overflow: 'normal',
      text: 'lorem ipsum',
      color: 'rgb(121, 75, 150)',
    },
  ],
  [
    '8',
    {
      objId: '8',
      type: 'TEXT',
      x: 0,
      y: 0,
      depth: 0.0003,
      parentId: '3',
      w: 100,
      fontSize: 5,
      overflow: 'normal',
      text: 'lorem ipsum',
      color: 'rgb(121, 75, 150)',
    },
  ],
]);

const createDocument = (documentName: string) => {
  const date = new Date().getTime();
  const newDocument: WBDocumentMetadata = {
    documentId: documents.length + 1,
    documentName: documentName,
    createdAt: date,
    modifiedAt: date,
  };
  documents.push(newDocument);
  return newDocument;
};

const getDocument = (documentID: number): undefined | Object => {
  for (let document of documents) {
    if (document.documentId === documentID)
      return { ...document, documentData: Object.fromEntries(documentData) };
  }
  return undefined;
};

const deleteDocument = (documentID: number): void => {
  documents = documents.filter((v) => {
    v.documentId === documentID;
  });
};

export const handlers = [
  rest.get(`${API_BASE_URL}/documents`, (_, res, ctx) => {
    return res(ctx.json(documents));
  }),
  rest.post(`${API_BASE_URL}/documents`, async (req, res, ctx) => {
    return res(ctx.json(createDocument((await req.json()).documentName)));
  }),
  rest.get(`${API_BASE_URL}/documents/:documentID`, (req, res, ctx) => {
    return res(ctx.json(getDocument(parseInt(req.params.documentID as string))));
  }),
  rest.delete(`${API_BASE_URL}/documents/:documentID`, (req, res, ctx) => {
    deleteDocument(parseInt(req.params.documentID as string));
    return res(ctx.status(200));
  }),
];
