import Link from 'next/link';
import styles from './kakaoLoginButton.module.css';
import { KAKAO_AUTH_URL } from '../../utils/api';
import Image from 'next/image';

export default function KakaoLoginButton() {
  return (
    <Link href={KAKAO_AUTH_URL} className={styles.link}>
      <div className={styles.container}>
        <Image
          className={styles.symbol}
          src={'/kakao.png'}
          alt={'kakao symbol'}
          width={20}
          height={20}
        />
        <p className={styles.label}>카카오 로그인</p>
      </div>
    </Link>
  );
}
