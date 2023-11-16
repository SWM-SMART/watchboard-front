import 'material-symbols';
import styles from './button.module.css';
import Link from 'next/link';

interface ButtonProps {
  text: string;
  icon?: string;
  highlight?: boolean;
  href: string;
}

export default function Button({ text, icon, href, highlight = true }: ButtonProps) {
  return (
    <Link href={href} style={highlight ? undefined : { color: 'var(--primary-dark)' }}>
      <div className={styles.container}>
        <span className={styles.text}>{text}</span>
        {icon === undefined ? null : (
          <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>
        )}
      </div>
    </Link>
  );
}
