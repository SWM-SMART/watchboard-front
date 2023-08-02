'use client';
import styles from './toolSelector.module.css';
import 'material-symbols';
import { currentToolState } from '@/states/whiteboard';
import { useRecoilState } from 'recoil';

export default function ToolSelector() {
  return (
    <div className={styles.container}>
      <ToolButton toolName={'SELECT'} icon={'arrow_selector_tool'} />
      <ToolButton toolName={'HAND'} icon={'drag_pan'} />
      <ToolButton toolName={'RECT'} icon={'rectangle'} />
      <ToolButton toolName={'TEXT'} icon={'insert_text'} />
    </div>
  );
}

interface ToolButtonProps {
  toolName: Tool;
  icon: string;
}

function ToolButton({ toolName, icon }: ToolButtonProps) {
  const [tool, setTool] = useRecoilState(currentToolState);
  return (
    <div
      className={`${styles.buttonContainer} ${tool === toolName ? styles.buttonSelection : ''}`}
      onClick={() => setTool(toolName)}
    >
      <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
    </div>
  );
}
