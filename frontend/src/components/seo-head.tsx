import type { Metadata } from 'next';
import { appConfig } from '@/lib/app.config';

interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

export function generateSeoMetadata(options: SeoOptions = {}): Metadata {
  const {
    title,
    description = appConfig.description,
    image = `${appConfig.url}${appConfig.branding.ogImage}`,
    url,
    type = 'website',
    noIndex = false,
  } = options;

  const fullTitle = title
    ? appConfig.seo.titleTemplate.replace('%s', title)
    : appConfig.seo.defaultTitle;
  const pageUrl = url || appConfig.url;

  return {
    title: fullTitle,
    description,
    keywords: [...appConfig.seo.keywords],
    authors: appConfig.seo.author ? [{ name: appConfig.seo.author }] : undefined,
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      title: fullTitle,
      description: description || undefined,
      type,
      url: pageUrl,
      siteName: appConfig.name,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description || undefined,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: pageUrl,
    },
    icons: {
      icon: appConfig.branding.favicon,
      apple: appConfig.branding.appleTouchIcon,
    },
  };
}

export function getDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(appConfig.url),
    title: {
      default: appConfig.seo.defaultTitle,
      template: appConfig.seo.titleTemplate,
    },
    description: appConfig.description,
    keywords: [...appConfig.seo.keywords],
    authors: appConfig.seo.author ? [{ name: appConfig.seo.author }] : undefined,
    openGraph: {
      type: 'website',
      siteName: appConfig.name,
      images: [{ url: appConfig.branding.ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
    },
    icons: {
      icon: appConfig.branding.favicon,
      apple: appConfig.branding.appleTouchIcon,
    },
  };
}
