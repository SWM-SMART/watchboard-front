import { useViewer } from '@/states/viewer';
import styles from './relationView.module.css';
interface RelationViewProps {
  node: NodeData;
  hidden?: boolean;
}

export default function RelationView({ node, hidden = false }: RelationViewProps) {
  const setSelectedNode = useViewer((state) => state.setSelectedNode);
  return (
    <div className={styles.container} style={hidden ? { display: 'none' } : undefined}>
      <div className={styles.nodeContainer}>
        <div className={styles.node}>
          <div
            className={styles.label}
            onClick={() => {
              if (node.parent != undefined) setSelectedNode(node.parent);
            }}
          >
            {node.parent?.label}
          </div>
        </div>
      </div>
      <div className={styles.nodeContainer}>
        <div className={styles.node}>
          <div className={`${styles.label} ${styles.current}`}>{node.label}</div>
        </div>
      </div>
      <div className={styles.nodeChildContainer}>
        <div className={styles.nodeContainer}>
          {node.children.map((v) => {
            return (
              <div key={v.id} className={styles.node}>
                <div onClick={() => setSelectedNode(v)} className={styles.label}>
                  {v.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
