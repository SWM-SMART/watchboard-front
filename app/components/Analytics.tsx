import Script from 'next/script';
export default function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', '${ga}');
        `}
      </Script>
    </>
  );
}
