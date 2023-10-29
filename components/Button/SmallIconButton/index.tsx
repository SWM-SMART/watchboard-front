import styles from './smallIconButton.module.css';
interface SmallIconButtonProps {
  icon: string;
  selected: boolean;
  onClick?: () => void;
}

export default function SmallIconButton({ icon, selected, onClick }: SmallIconButtonProps) {
  return (
    <div
      className={`${styles.buttonContainer} ${selected ? styles.buttonSelection : ''}`}
      onClick={onClick}
    >
      <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
    </div>
  );
}
