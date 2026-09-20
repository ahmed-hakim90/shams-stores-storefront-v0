export const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
export const GA4_ID = process.env.NEXT_PUBLIC_GA_ID || ''
export const TIKTOK_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || ''
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''

export const hasMeta = !!META_ID
export const hasGa4 = !!GA4_ID
export const hasTiktok = !!TIKTOK_ID
export const hasGoogleAds = !!GOOGLE_ADS_ID
export const hasAnyExtraPixel = hasMeta || hasGa4 || hasTiktok || hasGoogleAds

export const allPixelScripts = `
${META_ID ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_ID}');fbq('track','PageView');` : ''}
${GA4_ID ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA4_ID}');` : ''}
${TIKTOK_ID ? `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableScript","load"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${TIKTOK_ID}');ttq.page();}(window,document,'ttq');` : ''}
${GOOGLE_ADS_ID ? `!function(){var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}';s.async=true;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');}();` : ''}
`.trim()
