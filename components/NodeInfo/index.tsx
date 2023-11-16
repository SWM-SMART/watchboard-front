import { useState } from 'react';
import styles from './nodeInfo.module.css';
import SmallActionButton from '../Button/SmallActionButton';
import { useViewer } from '@/states/viewer';
import RelationView from './RelationView';
import SourceDataView from './SourceDataView';
import Link from 'next/link';

interface NodeInfoProps {
  node?: NodeData;
  answer: string | null;
}

export default function NodeInfo({ node, answer }: NodeInfoProps) {
  const [sourceView, setSourceView] = useState<boolean>(true);
  const [relationView, setRelationView] = useState<boolean>(true);
  const currentDocumentId = useViewer((state) => state.document?.documentId);
  const documentId = node?.documentId;
  const isLocalNode = documentId === currentDocumentId;

  const { setFocus, setView } = useViewer((state) => ({
    setFocus: state.focusNodeCallback,
    setView: state.setView,
  }));

  if (node === undefined) return <EmptyNodeInfo />;

  return (
    <div className={styles.container}>
      <h1>{node?.label}</h1>
      {isLocalNode ? null : <MixedNodeNotice documentId={documentId ?? 0} />}
      <div className={styles.actions}>
        <SmallActionButton
          border={true}
          enabled={relationView}
          label={'관계도'}
          icon={'network_node'}
          onClick={() => setRelationView((show) => !show)}
        />
        {isLocalNode ? (
          <SmallActionButton
            border={true}
            enabled={sourceView}
            label={'키워드 출처'}
            icon={'find_in_page'}
            onClick={() => setSourceView((show) => !show)}
          />
        ) : null}

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

      {isLocalNode ? <SourceDataView hidden={!sourceView} /> : null}
      {answer === null ? <LoadingNodeInfoString /> : <p>{answer}</p>}
    </div>
  );
}

interface MixedNodeNoticeProps {
  documentId: number;
}

function MixedNodeNotice({ documentId }: MixedNodeNoticeProps) {
  return (
    <div className={styles.notice}>
      <span className="material-symbols-outlined">warning</span>
      <p className={styles.noticeText}>
        해당 노드는 <b>MIX</b> 로 불러온 외부 노드입니다. 수정하려면{' '}
        <Link href={`/document/${documentId}`} className={styles.noticeLink}>
          여기
        </Link>
        를 클릭하여 원본 문서로 이동하세요
      </p>
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

function LoadingNodeInfoString() {
  return <div className={styles.loadingContainer}>설명을 불러오는 중입니다</div>;
}
