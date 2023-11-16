'use client';
import { useEffect } from 'react';
import { API_BASE_URL } from './api';
import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill';
import { useUser } from '@/states/user';
const EventSource = EventSourcePolyfill || NativeEventSource;

const DAY = 86400000;
const HOUR = 3600000;
const MINUTE = 60000;
const ERROR_EVENT_TYPE = 'wb-error';

/**
 * Generate time Difference string based on current time and input time
 *
 * @param {number} [millis] input time
 * @return {string} generated string
 */
export function timeDifference(millis: number): string {
  const diff = new Date().getTime() - millis;
  if (diff >= DAY) return `${Math.floor(diff / DAY)}일 전에 수정됨`;
  if (diff >= HOUR) return `${Math.floor(diff / HOUR)}시간 전에 수정됨`;
  if (diff >= MINUTE) return `${Math.floor(diff / MINUTE)}분 전에 수정됨`;
  return `방금전에 수정됨`;
}

export function throwError(msg: string) {
  document.dispatchEvent(new CustomEvent(ERROR_EVENT_TYPE, { detail: msg }));
}

type CustomErrorEvent = Event & { detail?: string };

export function useError(callback: (msg: string) => void) {
  useEffect(() => {
    const errorHandler = (e: CustomErrorEvent) => {
      const msg = e.detail;
      if (msg === undefined) return;
      callback(msg);
    };
    document.addEventListener(ERROR_EVENT_TYPE, errorHandler);
    return () => document.removeEventListener(ERROR_EVENT_TYPE, errorHandler);
  }, [callback]);
}

export function useViewerEvents(
  callback: (type: ViewerEventType, data: string) => void,
  documentId?: number,
) {
  const accessToken = useUser((state) => state.accessToken);
  useEffect(() => {
    if (documentId === undefined) return;
    const eventSource = new EventSource(`${API_BASE_URL}/documents/${documentId}/subscribe`, {
      withCredentials: true,
      headers: { Authorization: accessToken },
    });
    eventSource.addEventListener('sse', (e) => console.log('connection open', e));
    eventSource.addEventListener('mindmap', (e) => callback('mindmap', (e as any)!.data));
    eventSource.addEventListener('answer', (e) => callback('answer', (e as any)!.data));
    return () => eventSource.close();
  }, [accessToken, callback, documentId]);
}
