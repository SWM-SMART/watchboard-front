import 'material-symbols';
import styles from './linkButton.module.css';
import Link from 'next/link';

interface LinkButtonProps {
  text: string;
  icon?: string;
  href: string;
}

export default function LinkButton({ text, icon, href }: LinkButtonProps) {
  return (
    <Link href={href}>
      <div className={styles.container}>
        <span className={styles.text}>{text}</span>
        {icon === undefined ? null : (
          <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
        )}
      </div>
    </Link>
  );
}
