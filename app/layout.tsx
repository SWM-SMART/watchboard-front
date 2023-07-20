import RecoilRootWrapper from '@/components/RecoilRootWrapper';
import './globals.css';
import LoadMsw from './LoadMsw';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <LoadMsw />
        <RecoilRootWrapper>{children}</RecoilRootWrapper>
      </body>
    </html>
  );
}
