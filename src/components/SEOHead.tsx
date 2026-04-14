import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

function setMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function SEOHead() {
  const { seoData } = useApp();

  useEffect(() => {
    // Title
    if (seoData.metaTitle) {
      document.title = seoData.metaTitle;
    }

    // Basic meta
    setMetaTag('description', seoData.metaDescription);
    setMetaTag('keywords', seoData.metaKeywords);
    setMetaTag('robots', seoData.robots);

    // Open Graph
    setMetaTag('og:title', seoData.metaTitle, 'property');
    setMetaTag('og:description', seoData.metaDescription, 'property');
    setMetaTag('og:type', seoData.ogType, 'property');
    if (seoData.ogImage) {
      setMetaTag('og:image', seoData.ogImage, 'property');
    }
    if (seoData.canonicalUrl) {
      setMetaTag('og:url', seoData.canonicalUrl, 'property');
    }

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', seoData.metaTitle);
    setMetaTag('twitter:description', seoData.metaDescription);
    if (seoData.ogImage) {
      setMetaTag('twitter:image', seoData.ogImage);
    }

    // Canonical
    if (seoData.canonicalUrl) {
      setLinkTag('canonical', seoData.canonicalUrl);
    }

    // Verification
    if (seoData.googleVerification) {
      setMetaTag('google-site-verification', seoData.googleVerification);
    }
    if (seoData.bingVerification) {
      setMetaTag('msvalidate.01', seoData.bingVerification);
    }
  }, [seoData]);

  // Google Analytics script injection
  useEffect(() => {
    if (!seoData.googleAnalyticsId) return;
    const gaId = seoData.googleAnalyticsId.trim();
    if (!gaId || document.querySelector(`script[src*="${gaId}"]`)) return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
    document.head.appendChild(script2);
  }, [seoData.googleAnalyticsId]);

  return null;
}
