import Image from 'next/image';
import styles from './page.module.css';
import screenshot from '@/public/screenshot.png';
import BackgroundButton from '@/components/BackgroundButton';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <p className={styles.title} style={{ animation: 'var(--intro-animation)' }}>
        마인드맵으로 어떠한 자료든 쉽게 학습하세요
      </p>
      <BackgroundButton text={'데모 시작'} href={'/document/demo'} />
      <div className={styles.image}>
        <Image
          src={screenshot}
          alt={'screenshot'}
          fill={true}
          style={{ objectFit: 'contain', animation: 'var(--intro-animation)' }}
        />
      </div>
    </div>
  );
}
