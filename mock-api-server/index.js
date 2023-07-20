require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
const app = express();
const port = 3333;
const baseUrl = `http://localhost:${port}`;

const kakaoCallbackUrl = `${baseUrl}/users/auth/kakao/callback`;
const kakaoOauthUrl = 'https://kauth.kakao.com/oauth/authorize';

const documents = [
  {
    document_id: 0,
    document_name: 'document0',
    created_at: '2023-07-20T04:49:46.901Z',
    modified_at: '2023-07-20T04:49:46.901Z',
  },
  {
    document_id: 1,
    document_name: 'document1',
    created_at: '2023-07-19T04:49:46.901Z',
    modified_at: '2023-07-20T04:49:46.901Z',
  },
  {
    document_id: 2,
    document_name: 'document2',
    created_at: '2023-07-21T04:49:46.901Z',
    modified_at: '2023-07-22T04:49:46.901Z',
  },
];

const documentData = {
  a: {
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
  b: {
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
  c: {
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
};

const createDocument = (document_name) => {
  const date = new Date().toJSON();
  const newDocument = {
    document_id: documents.length + 1,
    document_name: document_name,
    created_at: date,
    modified_at: date,
  };
  documents.push(newDocument);
  return newDocument;
};

const getDocument = (documentID) => {
  for (let document of documents) {
    if (document.document_id === documentID) return document;
  }
  return undefined;
};

const deleteDocument = (documentID) => {
  documents = documents.filter((v) => {
    v.document_id === documentID;
  });
};

app.get('/users/auth/kakao', (req, res) => {
  res.redirect(
    `${kakaoOauthUrl}?response_type=code&client_id=${process.env.KAKAO_API_KEY}&redirect_uri=${kakaoCallbackUrl}`,
  );
  res.end();
});

app.get('/users/auth/kakao/callback', (req, res) => {
  if (req.query.code !== undefined) {
    res.status(200);
    res.cookie('token', '000000');
  } else {
    res.sendStatus(400);
  }
  res.end();
});

app.get('/users/logout', (req, res) => {
  res.clearCookie('token');
  res.end();
});

app.get('/documents/:documentID', (req, res) => {
  const document = getDocument(parseInt(req.params.documentID));
  if (document === undefined) {
    res.sendStatus(400);
  } else {
    res.status(200);
    res.json({ ...document, document_data: documentData });
  }
  res.end();
});

app.delete('/documents/:documentID', (req, res) => {
  deleteDocument(parseInt(req.params.documentID));
  res.sendStatus(200);
  res.end();
});

app.get('/documents', (req, res) => {
  res.json(documents);
  res.end();
});

app.post('/documents', jsonParser, (req, res) => {
  if (req.body.document_name === undefined) {
    res.sendStatus(400);
  } else {
    res.status(201);
    res.json(createDocument(req.body.document_name));
  }
  res.end();
});

app.listen(port, () => {
  console.log(`Mock api server running on ${baseUrl}`);
});
