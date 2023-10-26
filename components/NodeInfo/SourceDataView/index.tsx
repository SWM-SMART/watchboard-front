import { useViewer } from '@/states/viewer';
import styles from './sourceDataView.module.css';
import { useEffect, useState } from 'react';
import ToolSelector, { SmallIconButton, ToolButton } from '@/components/WhiteBoard/ToolSelector';
import SmallActionButton from '@/components/Button/SmallActionButton';
interface SourceDataViewProps {
  hidden?: boolean;
}
export default function SourceDataView({ hidden = false }: SourceDataViewProps) {
  const { node, findDataStr, focusKeyword, setView } = useViewer((state) => ({
    node: state.selectedNode,
    findDataStr: state.findDataStr,
    focusKeyword: state.focusKeywordCallback,
    setView: state.setView,
  }));
  const [index, setIndex] = useState<number>(0);
  const [history, setHistory] = useState<KeywordSourceResult[]>([]);

  // get first
  useEffect(() => {
    if (node === undefined) return;
    const res = findDataStr([0, -1], node.label);
    if (res === undefined) return;
    setHistory([res]);
    return () => {
      setIndex(0);
      setHistory([]);
    };
  }, [node, findDataStr]);

  if (history.length === 0)
    return (
      <div className={styles.container} style={hidden ? { display: 'none' } : undefined}>
        결과 없음
      </div>
    );

  return (
    <div className={styles.container} style={hidden ? { display: 'none' } : undefined}>
      <div className={styles.headerContainer}>
        <div className={styles.buttonContainer}>
          <SmallIconButton
            icon={'navigate_before'}
            selected={false}
            onClick={() => setIndex((index) => (index > 0 ? index - 1 : 0))}
          />
          <p style={{ width: '50px' }}>{index + 1}</p>
          <SmallIconButton
            icon={'navigate_next'}
            selected={false}
            onClick={() => {
              // is last
              if (index === history.length - 1) {
                const prevRes = history[index];
                const nextRes = findDataStr(prevRes.location, prevRes.keyword);
                if (nextRes === undefined) return;
                setHistory([...history, nextRes]);
                setIndex((index) => index + 1);
              } else setIndex((index) => index + 1);
            }}
          />
        </div>
        <SmallActionButton
          label={'출처로 이동'}
          icon={'open_in_new'}
          onClick={() => {
            if (focusKeyword === undefined) return;
            setView('DATA');
            focusKeyword(history[index].keyword, history[index].location);
          }}
        />
      </div>
      <p>{history[index].str}</p>
    </div>
  );
}
