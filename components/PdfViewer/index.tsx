'use client';
import { Document, Page, pdfjs } from 'react-pdf';
import styles from './PdfViewer.module.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import OptionPanel from './OptionPanel';
import { useViewer } from '@/states/viewer';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface PdfViewerProps {
  url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
  const [tool, setTool] = useState<Tool>('SELECT');
  const [scale, setScale] = useState<number>(1);
  const [page, setPage] = useState<number>(0);
  const [numPages, setNumPages] = useState<number>(0);
  const { keywords, addKeyword, setDataStr } = useViewer((state) => ({
    keywords: state.keywords,
    addKeyword: state.addKeyword,
    setDataStr: state.setDataStr,
  }));

  useFocusKeyword(setPage);

  const onPointerUp = () => {
    if (tool !== 'HIGHLIGHT') return;
    // add selection to keywords
    const word = window.getSelection()?.toString() ?? '';
    if (word.length === 0) return;
    addKeyword(word, true);
  };

  const textRenderer = useCallback(
    (textItem: any) => {
      // highlights keywords
      const pos: Pos[] = [];
      for (const [s, f] of keywords.entries()) {
        // find all occurences
        if (!f) continue;
        const matches = (textItem.str as string).matchAll(new RegExp(s, 'gi'));
        for (const m of matches) {
          if (m.index === undefined) continue;
          pos.push({ start: m.index, end: m.index + s.length });
        }
      }
      // add marks
      const str = mergeAndApplyMarks(textItem.str as string, pos);
      return str;
    },
    [keywords],
  );

  return (
    <div className={styles.container}>
      <div className={styles.viewerContainer}>
        <div className={styles.viewer}>
          <Document
            file={url}
            onLoadSuccess={async (d) => {
              // save all text
              const data: string[][] = [];
              for (let i = 1; i <= d.numPages; i++) {
                data.push(
                  (await (await d.getPage(i)).getTextContent()).items.map<string>((v) => {
                    return (v as any).str;
                  }),
                );
              }
              console.log(data);
              setDataStr(data);
              setNumPages(d.numPages);
            }}
          >
            <Page
              scale={scale}
              pageIndex={page}
              onPointerUp={onPointerUp}
              customTextRenderer={textRenderer}
            />
          </Document>
        </div>
      </div>

      <OptionPanel
        currentTool={tool}
        setCurrentTool={setTool}
        scale={scale}
        setScale={setScale}
        page={page}
        setPage={setPage}
        numPages={numPages}
      />
    </div>
  );
}

function useFocusKeyword(setPage: Dispatch<SetStateAction<number>>) {
  const { setCallback, setKeyWord, setAllKeyword } = useViewer((state) => ({
    setCallback: state.setFocusKeywordCallback,
    setKeyWord: state.setKeyword,
    setAllKeyword: state.setAllKeyword,
  }));
  useEffect(() => {
    setCallback((keyword, location) => {
      setPage(location[0]);
      setAllKeyword(false);
      setKeyWord(keyword, true);
    });
    return () => setCallback(undefined);
  }, [setAllKeyword, setCallback, setKeyWord, setPage]);
}

interface Pos {
  start: number;
  end: number;
}

function posSorter(a: Pos, b: Pos) {
  // latter item comes first
  if (a.end > b.end) {
    return -1;
  } else if (a.end < b.end) {
    return 1;
  } else {
    return a.start > b.start ? -1 : 1;
  }
}

export function mergeAndApplyMarks(sourceStr: string, pos: Pos[]): string {
  let str = sourceStr;
  // sort occurences
  pos.sort(posSorter);

  // apply occurences
  const bounds: Pos = { start: -1, end: -1 };
  for (const p of pos) {
    // first
    if (bounds.start === -1 || bounds.end === -1) {
      // update bounds
      bounds.end = p.end;
      bounds.start = p.start;
    } else if (p.end < bounds.start) {
      // mark
      str =
        str.slice(0, bounds.start) +
        '<mark>' +
        str.slice(bounds.start, bounds.end) +
        '</mark>' +
        str.slice(bounds.end);
      // update bounds
      bounds.end = p.end;
      bounds.start = p.start;
    } else {
      bounds.end = Math.max(bounds.end, p.end);
      bounds.start = Math.min(bounds.start, p.start);
    }
  }
  // apply last mark
  if (bounds.start !== -1 || bounds.end !== -1) {
    str =
      str.slice(0, bounds.start) +
      '<mark>' +
      str.slice(bounds.start, bounds.end) +
      '</mark>' +
      str.slice(bounds.end);
  }

  return str;
}
