import { httpDelete, httpGet, httpPost } from './http';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URL = `${API_BASE_URL}/users/auth/kakao/callback`;
export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URL}`;

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
