import RecoilRootWrapper from '@/app/components/RecoilRootWrapper';
import './globals.css';
import { Inter } from 'next/font/google';
import LoadMsw from './components/LoadMsw';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={inter.className}>
        <LoadMsw />
        <RecoilRootWrapper>{children}</RecoilRootWrapper>
      </body>
    </html>
  );
}
