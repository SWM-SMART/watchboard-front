import { useEffect, useState } from 'react';
import styles from './nodeInfo.module.css';
import SmallActionButton from '../Button/SmallActionButton';
import { useViewer } from '@/states/viewer';
import RelationView from './RelationView';
import SourceDataView from './SourceDataView';
import { getKeywordInfo } from '@/utils/api';

interface NodeInfoProps {
  node?: NodeData;
}
export default function NodeInfo({ node }: NodeInfoProps) {
  const [data, setData] = useState<string>();
  const [sourceView, setSourceView] = useState<boolean>(true);
  const [relationView, setRelationView] = useState<boolean>(true);
  const documentId = useViewer((state) => state.document?.documentId);

  useEffect(() => {
    if (node === undefined || documentId === undefined) return;
    (async () => {
      const data = await getKeywordInfo(documentId, node.label);
      setData(data.text);
    })();

    return () => setData(undefined);
  }, [documentId, node]);

  const { setFocus, setView } = useViewer((state) => ({
    setFocus: state.focusNodeCallback,
    setView: state.setView,
  }));

  if (node === undefined) return <EmptyNodeInfo />;

  return (
    <div className={styles.container}>
      <h1>{node?.label}</h1>
      <div className={styles.actions}>
        <SmallActionButton
          border={true}
          enabled={relationView}
          label={'관계도'}
          icon={'network_node'}
          onClick={() => setRelationView((show) => !show)}
        />
        <SmallActionButton
          border={true}
          enabled={sourceView}
          label={'키워드 출처'}
          icon={'find_in_page'}
          onClick={() => setSourceView((show) => !show)}
        />
        <SmallActionButton
          border={true}
          label={'노드로 이동'}
          icon={'my_location'}
          onClick={() => {
            if (setFocus === undefined) return;
            setFocus(node);
            setView('HOME');
          }}
        />
      </div>
      <RelationView node={node} hidden={!relationView} />

      <SourceDataView hidden={!sourceView} />
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
