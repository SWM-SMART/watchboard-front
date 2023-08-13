'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import styles from './toolSelector.module.css';
import 'material-symbols';

export default function ToolSelector() {
  return (
    <div className={styles.container}>
      <ToolButton toolName={'SELECT'} icon={'arrow_selector_tool'} />
      <ToolButton toolName={'HAND'} icon={'drag_pan'} />
      <ToolButton toolName={'RECT'} icon={'rectangle'} />
      <ToolButton toolName={'TEXT'} icon={'insert_text'} />
      <ToolButton toolName={'LINE'} icon={'linear_scale'} />
    </div>
  );
}

interface ToolButtonProps {
  toolName: Tool;
  icon: string;
}

function ToolButton({ toolName, icon }: ToolButtonProps) {
  const { currentTool, setCurrentTool } = useWhiteBoard((state) => ({
    currentTool: state.currentTool,
    setCurrentTool: state.setCurrentTool,
  }));

  return (
    <div
      className={`${styles.buttonContainer} ${
        currentTool === toolName ? styles.buttonSelection : ''
      }`}
      onClick={() => setCurrentTool(toolName)}
    >
      <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
    </div>
  );
}
