import { useViewer } from '@/states/viewer';
import styles from './audioViewer.module.css';
import OptionPanel from '../OptionPanel';
import AudioViewerOptions from './AudioViewerOptions';
import { Dispatch, RefObject, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { Pos, getKeywordPos, mergePos } from '@/utils/viewerHelper';

interface AudioViewerProps {
  dataSource: WBSourceData;
}

export default function AudioViewer({ dataSource }: AudioViewerProps) {
  const { setDataStr } = useViewer((state) => ({
    setDataStr: state.setDataStr,
  }));

  const audioRef = useRef<HTMLAudioElement>(null);
  const data = dataSource as WBSourceAudioData;
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [selectIndex, setSelectIndex] = useState<number>(0);

  useEffect(() => {
    const dataStr: string[][] = [];
    for (const speech of data.data) {
      dataStr.push([speech.text]);
    }
    setDataStr(dataStr);
  }, [data.data, setDataStr]);

  useFocusKeyword(data, audioRef, setFocusIndex, setSelectIndex);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {data.data.map((v, i) => {
          return (
            <TextBubble
              key={v.start}
              data={v}
              audio={audioRef}
              index={i}
              focusIndex={focusIndex}
              selectIndex={selectIndex}
              setSelectIndex={setSelectIndex}
            />
          );
        })}
      </div>
      <OptionPanel>
        <AudioViewerOptions ref={audioRef} url={dataSource.url} />
      </OptionPanel>
    </div>
  );
}

function useFocusKeyword(
  data: WBSourceAudioData,
  audioRef: RefObject<HTMLAudioElement>,
  setFocusIndex: Dispatch<SetStateAction<number>>,
  setSelectIndex: Dispatch<SetStateAction<number>>,
) {
  const { setCallback, setKeyWord, setAllKeyword } = useViewer((state) => ({
    setCallback: state.setFocusKeywordCallback,
    setKeyWord: state.setKeyword,
    setAllKeyword: state.setAllKeyword,
  }));
  useEffect(() => {
    setCallback((keyword, location) => {
      setAllKeyword(false);
      setKeyWord(keyword, true);
      setFocusIndex(location[0]);
      setSelectIndex(location[0]);
      if (audioRef.current === null) return;
      audioRef.current.currentTime = data.data[location[0]].start / 1000;
    });
    return () => setCallback(undefined);
  }, [audioRef, data.data, setAllKeyword, setCallback, setFocusIndex, setKeyWord, setSelectIndex]);
}

interface TextBubbleProps {
  data: SpeechData;
  audio: RefObject<HTMLAudioElement>;
  index: number;
  focusIndex: number;
  selectIndex: number;
  setSelectIndex: Dispatch<SetStateAction<number>>;
}
function TextBubble({
  data,
  audio,
  index,
  focusIndex,
  selectIndex,
  setSelectIndex,
}: TextBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { keywords, addKeyword, currentTool } = useViewer((state) => ({
    keywords: state.keywords,
    addKeyword: state.addKeyword,
    currentTool: state.currentTool,
  }));

  const keywordPos = useMemo(() => {
    return mergePos(getKeywordPos(data.text, keywords)).reverse();
  }, [data.text, keywords]);

  const highlightedText = keywordPos.map((v, i) => {
    return (
      <>
        {data.text.slice(i == 0 ? 0 : keywordPos[i - 1].end, v.start)}
        <mark className={styles.mark}>{data.text.slice(v.start, v.end)}</mark>
        {i == keywordPos.length - 1 ? data.text.slice(v.end) : ''}
      </>
    );
  });

  useEffect(() => {
    if (index === focusIndex) containerRef.current?.scrollIntoView();
  }, [focusIndex, index]);

  return (
    <div
      onClick={() => {
        setSelectIndex(index);
        if (audio.current === null) return;
        audio.current.currentTime = data.start / 1000;
      }}
      ref={containerRef}
      className={`${styles.bubbleContainer} ${selectIndex === index ? styles.selected : ''}`}
    >
      <p className={styles.timestamp}>{msToTimsstamp(data.start)}</p>
      <p
        className={styles.text}
        onClick={(e) => {
          const selection = window.getSelection();
          if (selection === null || selection.toString().length == 0) return;
          e.stopPropagation();
          if (currentTool !== 'HIGHLIGHT') return;
          addKeyword(selection.toString(), true);
        }}
      >
        {highlightedText.length === 0 ? data.text : highlightedText}
      </p>
    </div>
  );
}

function pad(n: number, z: number) {
  z = z || 2;
  return ('00' + n).slice(-z);
}

function msToTimsstamp(millis: number): string {
  const s = Math.floor((millis / 1000) % 60);
  const m = Math.floor((millis / (60 * 1000)) % 60);
  const h = Math.floor((millis / (60 * 60 * 1000)) % 60);
  return `${h}:${pad(m, 2)}:${pad(s, 2)}`;
}
