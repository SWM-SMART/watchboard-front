import { httpDelete, httpGet, httpPost } from './http';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getDocumentList(): Promise<WBDocumentListReponse> {
  return (await httpGet(`${API_BASE_URL}/documents`)).json();
}

export async function getDocument(document_id: number): Promise<WBDocumentReponse> {
  return (await httpGet(`${API_BASE_URL}/documents/${document_id}`)).json();
}

export async function createDocument(document_name: string): Promise<WBDocumentCreateResponse> {
  return (await httpPost(`${API_BASE_URL}/documents`, { document_name: document_name })).json();
}

export async function deleteDocument(document_id: number) {
  await httpDelete(`${API_BASE_URL}/documents/${document_id}`);
}
