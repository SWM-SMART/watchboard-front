'use client';
import { useRecoilState } from 'recoil';
import { documentListState } from '../../states/document';
import { useEffect } from 'react';
import { getDocumentList } from '../../utils/api';
import Card from '../../components/Card';

export default function DocumentList() {
  const [documentList, setDocumentList] = useRecoilState(documentListState);

  useEffect(() => {
    (async () => {
      setDocumentList(await getDocumentList());
    })();
  }, [setDocumentList]);

  return documentList.map((document) => {
    return <Card key={`document-card-${document.document_id}`} document={document} />;
  });
}
