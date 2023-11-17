'use client';
import { useDocument } from '../../states/document';
import { useEffect } from 'react';
import Card from '../../components/Card';

export default function DocumentList() {
  const { documentList, fetchDocumentList } = useDocument();

  useEffect(() => {
    fetchDocumentList();
  }, [fetchDocumentList]);

  return documentList?.map((document) => {
    return <Card key={`document-card-${document.documentId}`} document={document} />;
  });
}
