'use client';
import { useEffect } from 'react';

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

export function dispatchViewerEvent(documentId: number, type: ViewerEventType, data: string) {
  document.dispatchEvent(
    new CustomEvent(`VIEWER_UPDATE_${documentId}`, { detail: { type, data } }),
  );
}

type CustomViewerEvent = Event & { detail?: { type: ViewerEventType; data: string } };

export function useViewerEvent(
  callback: (type: ViewerEventType, data: string) => void,
  documentId?: number,
) {
  useEffect(() => {
    if (documentId === undefined || documentId < 0) return; // is demo
    const viewerEventHandler = (e: CustomViewerEvent) => {
      const msg = e.detail;
      if (msg === undefined) return;
      callback(msg.type, msg.data);
    };
    document.addEventListener(`VIEWER_UPDATE_${documentId}`, viewerEventHandler);
    return () => document.removeEventListener(`VIEWER_UPDATE_${documentId}`, viewerEventHandler);
  }, [callback, documentId]);
}
