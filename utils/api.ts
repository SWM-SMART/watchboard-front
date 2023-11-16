import { demoDocumentList, demoGraphData, getDemoDocument } from './demoHelper';
import { httpDelete, httpGet, httpPost, httpPut } from './http';
import { throwError } from './ui';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const KAKAO_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/kakao`;

export async function getDocumentList(demo?: boolean): Promise<WBDocumentListReponse> {
  if (demo) return demoDocumentList;
  return (await httpGet(`${API_BASE_URL}/documents`))?.json();
}

export async function getDocument(documentId: number): Promise<WBDocumentReponse> {
  if (documentId < 0) return getDemoDocument(documentId); //is demo
  return (await httpGet(`${API_BASE_URL}/documents/${documentId}`))?.json();
}

export async function createDocument(documentName: string): Promise<WBDocumentCreateResponse> {
  return (await httpPost(`${API_BASE_URL}/documents`, { documentName: documentName }))?.json();
}

export async function deleteDocument(documentId: number) {
  const res = await httpDelete(`${API_BASE_URL}/documents/${documentId}`, null);
  return res?.status;
}

export async function getUserData(): Promise<UserDataResponse> {
  return (await httpGet(`${API_BASE_URL}/users/info`))?.json();
}

export async function refreshToken(): Promise<string | null> {
  return (
    (await httpGet(`${API_BASE_URL}/users/token`, false, true, true))?.headers.get(
      'Authorization',
    ) || ''
  );
}

export async function getMindMapData(documentId: number): Promise<GraphData | null> {
  if (documentId < 0) return demoGraphData; //is demo
  const res = await httpGet(`${API_BASE_URL}/documents/${documentId}/mindmap`);
  if (res?.status === 200) return res.json();
  return null;
}

export async function getDataSource(
  documentId: number,
  type: WBSourceDataType,
): Promise<WBSourceData> {
  if (documentId < 0) return { url: '' }; //is demo
  return (await httpGet(`${API_BASE_URL}/documents/${documentId}/${type}`))?.json();
}

export async function updateKeywords(documentId: number, addition: string[], deletion: string[]) {
  return await httpPut(`${API_BASE_URL}/documents/${documentId}/mindmap/keyword`, {
    add: addition,
    delete: deletion,
  });
}

export async function getKeywordInfo(
  documentId: number,
  keyword: string,
  signal?: AbortSignal,
): Promise<KeywordResponse | null> {
  if (documentId < 0) return { text: `키워드 "${keyword}"에 대한 정보가 이곳에 표시됩니다!` }; //is demo
  const res = await httpGet(
    `${API_BASE_URL}/documents/${documentId}/mindmap/keyword/${keyword}`,
    true,
    true,
    false,
    signal,
  );
  if (res?.status === 200) return res?.json();
  return null;
}

export async function uploadFile(documentId: number, file: File) {
  const type = uploadFileType(file.type);
  if (type === undefined) return;
  const form = new FormData();
  form.append(type, file);
  return await httpPost(`${API_BASE_URL}/documents/${documentId}/${type}`, form, false, false);
}

function uploadFileType(type: string) {
  switch (type) {
    case 'application/pdf':
      return 'pdf';
    case 'audio/mpeg':
      return 'audio';
  }
  throwError('지원하지 않는 파일형식 입니다.');
}
