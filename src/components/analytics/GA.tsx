"use client";
import Script from "next/script";

export default function GA() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;
  return (
    <>
      <Script id="ga-consent-default" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          analytics_storage: (localStorage.getItem('zenturo_consent') === 'granted') ? 'granted' : 'denied',
        });
      `}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);} gtag('js', new Date());
        gtag('config', '${id}', { anonymize_ip: true });
      `}</Script>
    </>
  );
}