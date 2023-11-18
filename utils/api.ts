import { useUser } from '@/states/user';
import { demoDocumentList, demoGraphData, getDemoDocument } from './demoHelper';
import { httpDelete, httpGet, httpPost, httpPut } from './http';
import { throwError } from './ui';
import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill';
const EventSource = EventSourcePolyfill || NativeEventSource;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const KAKAO_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/kakao`;

export async function getDocumentList(demo?: boolean): Promise<WBDocumentListReponse | undefined> {
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
  return (await httpGet(`${API_BASE_URL}/users/info`, true, true, true))?.json();
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
  return await httpPut(
    `${API_BASE_URL}/documents/${documentId}/mindmap/keyword`,
    {
      add: addition,
      delete: deletion,
    },
    true,
    true,
    false,
  );
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
  return (await httpPost(`${API_BASE_URL}/documents/${documentId}/${type}`, form, false, false))
    ?.status;
}

export async function logout(): Promise<boolean> {
  const res = await httpGet(`${API_BASE_URL}/users/logout`, true, true, true);
  if (res?.status === 200) return true;
  return false;
}

export function createDocumentEventSource(documentId?: number) {
  if (documentId === undefined || documentId < 0) return undefined; // is demo

  const accessToken = useUser.getState().accessToken;
  const eventSource = new EventSource(`${API_BASE_URL}/documents/${documentId}/subscribe`, {
    withCredentials: true,
    headers: { Authorization: accessToken },
  });
  const eventTypes: ViewerEventType[] = ['answer', 'audio', 'keywords', 'mindmap', 'sse'];
  for (const type of eventTypes) {
    eventSource.addEventListener(type, (e) => {
      console.log(type, e);
      document.dispatchEvent(
        new CustomEvent(`VIEWER_UPDATE_${documentId}`, {
          detail: { type: type, data: (e as any)!.data },
        }),
      );
    });
  }
  return eventSource;
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
