'use client';
import { Document, Page, pdfjs } from 'react-pdf';
import styles from './PdfViewer.module.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import OptionPanel from '../OptionPanel';
import { useViewer } from '@/states/viewer';
import PdfViewerOptions from './PdfViewerOptions';
import { highlightKeywordStr } from '@/utils/viewerHelper';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface PdfViewerProps {
  dataSource: WBSourceData;
}

export default function PdfViewer({ dataSource }: PdfViewerProps) {
  const [scale, setScale] = useState<number>(1);
  const [page, setPage] = useState<number>(0);
  const [numPages, setNumPages] = useState<number>(0);
  const { keywords, addKeyword, setDataStr, tool } = useViewer((state) => ({
    keywords: state.keywords,
    addKeyword: state.addKeyword,
    setDataStr: state.setDataStr,
    tool: state.currentTool,
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
      return highlightKeywordStr(textItem.str, keywords);
    },
    [keywords],
  );

  return (
    <div className={styles.container}>
      <div className={styles.viewerContainer}>
        <div className={styles.viewer}>
          <Document
            file={dataSource.url}
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
              setDataStr(data);
              setNumPages(d.numPages);
            }}
          >
            <Page
              scale={scale}
              pageIndex={page}
              onMouseUp={onPointerUp}
              customTextRenderer={textRenderer}
            />
          </Document>
        </div>
      </div>

      <OptionPanel>
        <PdfViewerOptions
          scale={scale}
          setScale={setScale}
          page={page}
          setPage={setPage}
          numPages={numPages}
        />
      </OptionPanel>
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
      setKeyWord(keyword, {
        enabled: true,
      });
    });
    return () => setCallback(undefined);
  }, [setAllKeyword, setCallback, setKeyWord, setPage]);
}
