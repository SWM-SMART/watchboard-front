import styles from './backgroundButton.module.css';
import 'material-symbols';
import Link from 'next/link';

interface BackgroundButtonProps {
  text: string;
  icon?: string;
  invert?: boolean;
  href: string;
}

export default function BackgroundButton({ text, icon, invert, href }: BackgroundButtonProps) {
  return (
    <Link href={href} className={styles.link}>
      <div className={`${styles.container} ${invert ? styles.invert : null}`}>
        {icon === undefined ? null : (
          <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
        )}
        <span className={styles.text}>{text}</span>
      </div>
    </Link>
  );
}
