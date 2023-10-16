'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import styles from './toolSelector.module.css';
import 'material-symbols';

export default function ToolSelector() {
  const { currentTool, setCurrentTool } = useWhiteBoard((state) => ({
    currentTool: state.currentTool,
    setCurrentTool: state.setCurrentTool,
  }));
  return (
    <div className={styles.container}>
      <ToolButton
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        toolName={'SELECT'}
        icon={'arrow_selector_tool'}
      />
      <ToolButton
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        toolName={'HAND'}
        icon={'drag_pan'}
      />
      <ToolButton
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        toolName={'RECT'}
        icon={'rectangle'}
      />
      <ToolButton
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        toolName={'TEXT'}
        icon={'insert_text'}
      />
      <ToolButton
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        toolName={'LINE'}
        icon={'linear_scale'}
      />
      <ToolButton
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        toolName={'CIRCLE'}
        icon={'circle'}
      />
    </div>
  );
}

interface ToolButtonProps {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  toolName: Tool;
  icon: string;
}

export function ToolButton({ currentTool, setCurrentTool, toolName, icon }: ToolButtonProps) {
  return (
    <SmallIconButton
      icon={icon}
      selected={currentTool === toolName}
      onClick={() => setCurrentTool(toolName)}
    />
  );
}

interface SmallIconButtonProps {
  icon: string;
  selected: boolean;
  onClick?: () => void;
}

export function SmallIconButton({ icon, selected, onClick }: SmallIconButtonProps) {
  return (
    <div
      className={`${styles.buttonContainer} ${selected ? styles.buttonSelection : ''}`}
      onClick={onClick}
    >
      <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
    </div>
  );
}
