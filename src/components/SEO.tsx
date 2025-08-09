import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
    section?: string;
  };
}

interface SEOSettingsData {
  site_name: string;
  site_description: string;
  site_url: string;
  author_name: string;
  author_bio: string;
  default_title: string;
  default_description: string;
  default_keywords: string;
  default_image: string;
  twitter_handle: string;
  facebook_page: string;
  instagram_handle: string;
  github_username: string;
  linkedin_profile: string;
  auto_generate_descriptions: boolean;
  include_author_meta: boolean;
  enable_json_ld: boolean;
  enable_twitter_cards: boolean;
  enable_og_tags: boolean;
  google_analytics_id: string;
  google_search_console_id: string;
  custom_head_tags: string;
}

const defaultSettings: SEOSettingsData = {
  site_name: "Essa Ahmed - Portfolio & Blog",
  site_description: "Explore articles, projects, and insights about web development, data science, and technology.",
  site_url: typeof window !== 'undefined' ? window.location.origin : '',
  author_name: "Essa Ahmed",
  author_bio: "Full-stack developer and data scientist passionate about creating innovative solutions.",
  default_title: "Portfolio & Blog",
  default_description: "Explore articles, projects, and insights about web development, data science, and technology.",
  default_keywords: "web development, data science, portfolio, blog, react, python, javascript, technology",
  default_image: "/og-image.jpg",
  twitter_handle: "@essaahmed",
  facebook_page: "",
  instagram_handle: "",
  github_username: "essaahmed",
  linkedin_profile: "",
  auto_generate_descriptions: true,
  include_author_meta: true,
  enable_json_ld: true,
  enable_twitter_cards: true,
  enable_og_tags: true,
  google_analytics_id: "",
  google_search_console_id: "",
  custom_head_tags: "",
};

const SEO = ({ 
  title,
  description,
  image,
  url,
  type = "website",
  article
}: SEOProps) => {
  const [settings, setSettings] = useState<SEOSettingsData>(defaultSettings);

  useEffect(() => {
    loadSEOSettings();
  }, []);

  const loadSEOSettings = async () => {
    try {
      // Try to load from database first
      const { data: dbSettings, error } = await supabase
        .from('seo_settings')
        .select('*')
        .single();

      if (!error && dbSettings) {
        setSettings({ ...defaultSettings, ...dbSettings });
        return;
      }

      // Fallback to localStorage
      const localSettings = localStorage.getItem('seo_settings');
      if (localSettings) {
        const parsedSettings = JSON.parse(localSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.log('Using default SEO settings');
    }
  };

  // Build SEO values with dynamic settings
  const seoTitle = title || settings.default_title;
  const fullTitle = seoTitle === settings.default_title ? settings.site_name : `${seoTitle} | ${settings.site_name}`;
  const seoDescription = description || settings.default_description;
  const fullUrl = url ? `${settings.site_url}${url}` : (typeof window !== 'undefined' ? window.location.href : settings.site_url);
  const fullImage = image ? 
    (image.startsWith('http') ? image : `${settings.site_url}${image}`) : 
    `${settings.site_url}${settings.default_image}`;

  // Auto-generate description if enabled and not provided
  const finalDescription = settings.auto_generate_descriptions && !description && article 
    ? `${seoDescription.substring(0, 120)}...` 
    : seoDescription;

  const structuredData = settings.enable_json_ld ? {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "WebSite",
    "name": fullTitle,
    "description": finalDescription,
    "url": fullUrl,
    "image": fullImage,
    ...(type === "article" && article && {
      "headline": seoTitle,
      "datePublished": article.publishedTime,
      "dateModified": article.modifiedTime || article.publishedTime,
      "author": {
        "@type": "Person",
        "name": article.author || settings.author_name,
        "description": settings.author_bio
      },
      "publisher": {
        "@type": "Organization",
        "name": settings.site_name,
        "logo": {
          "@type": "ImageObject",
          "url": `${settings.site_url}/logo.png`
        }
      },
      "keywords": article.tags?.join(", ") || settings.default_keywords,
      "articleSection": article.section
    }),
    ...(type === "website" && {
      "author": {
        "@type": "Person",
        "name": settings.author_name,
        "url": settings.site_url,
        "description": settings.author_bio
      }
    })
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={settings.default_keywords} />
      
      {settings.include_author_meta && (
        <>
          <meta name="author" content={settings.author_name} />
          <meta name="creator" content={settings.author_name} />
        </>
      )}
      
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      {settings.enable_og_tags && (
        <>
          <meta property="og:type" content={type} />
          <meta property="og:title" content={fullTitle} />
          <meta property="og:description" content={finalDescription} />
          <meta property="og:image" content={fullImage} />
          <meta property="og:url" content={fullUrl} />
          <meta property="og:site_name" content={settings.site_name} />
          <meta property="og:locale" content="en_US" />
          
          {/* Article specific OG tags */}
          {type === "article" && article && (
            <>
              <meta property="article:published_time" content={article.publishedTime} />
              {article.modifiedTime && (
                <meta property="article:modified_time" content={article.modifiedTime} />
              )}
              <meta property="article:author" content={article.author || settings.author_name} />
              {article.section && (
                <meta property="article:section" content={article.section} />
              )}
              {article.tags && article.tags.map((tag, index) => (
                <meta key={index} property="article:tag" content={tag} />
              ))}
            </>
          )}
        </>
      )}
      
      {/* Twitter Card */}
      {settings.enable_twitter_cards && (
        <>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={fullTitle} />
          <meta name="twitter:description" content={finalDescription} />
          <meta name="twitter:image" content={fullImage} />
          {settings.twitter_handle && (
            <>
              <meta name="twitter:site" content={settings.twitter_handle} />
              <meta name="twitter:creator" content={settings.twitter_handle} />
            </>
          )}
        </>
      )}
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="EN" />
      <meta name="revisit-after" content="7 days" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#000000" />
      
      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Analytics */}
      {settings.google_analytics_id && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`} />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.google_analytics_id}');
            `}
          </script>
        </>
      )}
      
      {/* Google Search Console */}
      {settings.google_search_console_id && (
        <meta name="google-site-verification" content={settings.google_search_console_id} />
      )}
      
      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Custom Head Tags */}
      {settings.custom_head_tags && (
        <div dangerouslySetInnerHTML={{ __html: settings.custom_head_tags }} />
      )}
    </Helmet>
  );
};

export default SEO;