import { httpDelete, httpGet, httpPost } from './http';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const KAKAO_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/kakao`;

export async function getDocumentList(): Promise<WBDocumentListReponse> {
  return (await httpGet(`${API_BASE_URL}/documents`))?.json();
}

export async function getDocument(documentId: number): Promise<WBDocumentReponse> {
  return (await httpGet(`${API_BASE_URL}/documents/${documentId}`))?.json();
}

export async function createDocument(documentName: string): Promise<WBDocumentCreateResponse> {
  return (await httpPost(`${API_BASE_URL}/documents`, { documentName: documentName }))?.json();
}

export async function deleteDocument(documentId: number) {
  await httpDelete(`${API_BASE_URL}/documents/${documentId}`);
}

export async function getUserData(): Promise<UserDataResponse> {
  return (await httpGet(`${API_BASE_URL}/users/info`))?.json();
}

export async function refreshToken(): Promise<string | null> {
  return (await httpGet(`${API_BASE_URL}/users/token`, false))?.headers.get('Authorization') || '';
}

export async function generateGraph(text: textRequest): Promise<any> {
  return (await httpPost(`${API_BASE_URL}/users/token`, text))?.json();
}

export async function saveDocument(documentId: number, documentData: WBDocumentData) {
  // TODO: validation before sending
  const documentDataObject = Object.fromEntries(documentData);
  await httpPost(`${API_BASE_URL}/documents/${documentId}/data`, documentDataObject);
}
