import styles from './page.module.css';
import KakaoLoginButton from '../../components/KakaoLoginButton';
import Logo from '../../components/Logo';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <Logo width={200} height={100} />
      </div>
      <div className={styles.formContainer}>
        <KakaoLoginButton />
      </div>
    </div>
  );
}
