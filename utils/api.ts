import { httpDelete, httpGet, httpPost } from './http';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BASE_URL;
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
  return (
    (await httpGet(`${API_BASE_URL}/users/token`, false, true))?.headers.get('Authorization') || ''
  );
}

export async function getMindMapData(documentId: number): Promise<GraphData> {
  return (await httpGet(`${API_BASE_URL}/documents/${documentId}/mindmap`))?.json();
}

export async function getDataSource(
  documentId: number,
  type: WBSourceDataType,
): Promise<WBSourceData> {
  return (await httpGet(`${API_BASE_URL}/documents/${documentId}/${type}`))?.json();
}
