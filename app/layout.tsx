import ErrorHandler from './components/ErrorHandler';
import './globals.css';
import { Inter } from 'next/font/google';
import ToastViewer from './components/ToastViewer';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={inter.className}>
        <ErrorHandler />
        <ToastViewer />
        {children}
      </body>
    </html>
  );
}
