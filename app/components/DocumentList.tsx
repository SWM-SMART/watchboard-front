'use client';
import { useDocument } from '../../states/document';
import { useEffect } from 'react';
import Card from '../../components/Card';
import { useUser } from '@/states/user';
import { useRouter } from 'next/navigation';

export default function DocumentList() {
  const { documentList, fetchDocumentList } = useDocument();
  const userData = useUser((state) => state.userData);
  const router = useRouter();

  useEffect(() => {
    fetchDocumentList();
  }, [fetchDocumentList]);

  // redirect to landing page if not logged in
  if (userData === null) router.push('/landing');

  return documentList?.map((document) => {
    return <Card key={`document-card-${document.documentId}`} document={document} />;
  });
}
