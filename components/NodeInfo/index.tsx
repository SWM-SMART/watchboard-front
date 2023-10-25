import { useEffect, useState } from 'react';
import styles from './nodeInfo.module.css';
import { lipsum } from '@/utils/whiteboardHelper';
import SmallActionButton from '../Button/SmallActionButton';
import { useThree } from '@react-three/fiber';
import { useViewer } from '@/states/viewer';
import RelationView from './RelationView';

interface NodeInfoProps {
  node?: NodeData;
}
export default function NodeInfo({ node }: NodeInfoProps) {
  const [data, setData] = useState<string>();

  useEffect(() => {
    // TODO: fetch node data
    if (node === undefined) return;
    setData(lipsum);
    return () => setData(undefined);
  }, [node]);

  const { setFocus, setView } = useViewer((state) => ({
    setFocus: state.focusNodeCallback,
    setView: state.setView,
  }));

  if (node === undefined) return <EmptyNodeInfo />;

  return (
    <div className={styles.container}>
      <h1>{node?.label}</h1>
      <div className={styles.actions}>
        <SmallActionButton label={'키워드 출처'} icon={'find_in_page'} />
        <SmallActionButton
          label={'노드로 이동'}
          icon={'my_location'}
          onClick={() => {
            if (setFocus === undefined) return;
            setFocus(node);
            setView('HOME');
          }}
        />
      </div>
      <RelationView node={node} />
      <p>{data}</p>
    </div>
  );
}

function EmptyNodeInfo() {
  return (
    <div className={styles.container}>
      <p className={styles.guide}>
        노드 정보가 이곳에 표시됩니다. 마인드맵에서 노드를 선택해 주세요!
      </p>
    </div>
  );
}
