'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function MetaPixel() {
  const [pixelIds, setPixelIds] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/pixels/active`)
      .then((res) => (res.ok ? res.json() : []))
      .then((ids: string[]) => setPixelIds(ids))
      .catch(() => setPixelIds([]));
  }, []);

  if (pixelIds.length === 0) return null;

  const initScript = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    ${pixelIds.map((id) => `fbq('init', '${id}');`).join('\n    ')}
    fbq('track', 'PageView');
  `;

  return (
    <>
      <Script id="fb-pixel" strategy="afterInteractive">
        {initScript}
      </Script>
      {pixelIds.map((id) => (
        <noscript key={id}>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      ))}
    </>
  );
}
