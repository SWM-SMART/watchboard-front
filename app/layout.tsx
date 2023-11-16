import ErrorHandler from './components/ErrorHandler';
import styles from './page.module.css';
import './globals.css';
import { Inter } from 'next/font/google';
import ToastViewer from './components/ToastViewer';
import OverlayViewer from './components/OverlayViewer';
import Header from './components/Header';
import ContextMenuViewer from './components/ContextMenuViewer';
import Analytics from './components/Analytics';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={inter.className}>
        <Analytics />
        <ErrorHandler />
        <ToastViewer />
        <div className={styles.container}>
          <Header />
          <div className={styles.children}>{children}</div>
        </div>
        <OverlayViewer />
        <ContextMenuViewer />
      </body>
    </html>
  );
}
