import { Helmet } from "react-helmet-async";

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

const SEO = ({ 
  title = "Portfolio & Blog",
  description = "Explore articles, projects, and insights about web development, data science, and technology.",
  image = "/og-image.jpg",
  url,
  type = "website",
  article
}: SEOProps) => {
  const siteTitle = "Alex Chen - Portfolio & Blog";
  const fullTitle = title === "Portfolio & Blog" ? siteTitle : `${title} | ${siteTitle}`;
  const fullUrl = url ? `${window.location.origin}${url}` : window.location.href;
  const fullImage = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "WebSite",
    "name": fullTitle,
    "description": description,
    "url": fullUrl,
    "image": fullImage,
    ...(type === "article" && article && {
      "headline": title,
      "datePublished": article.publishedTime,
      "dateModified": article.modifiedTime || article.publishedTime,
      "author": {
        "@type": "Person",
        "name": article.author || "Alex Chen"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Alex Chen Portfolio",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      },
      "keywords": article.tags?.join(", "),
      "articleSection": article.section
    }),
    ...(type === "website" && {
      "author": {
        "@type": "Person",
        "name": "Alex Chen",
        "url": window.location.origin
      }
    })
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="web development, data science, portfolio, blog, react, python, javascript" />
      <meta name="author" content="Alex Chen" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Article specific OG tags */}
      {type === "article" && article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          <meta property="article:author" content={article.author || "Alex Chen"} />
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article.tags && article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@alexchen" />
      <meta name="twitter:creator" content="@alexchen" />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="EN" />
      <meta name="revisit-after" content="7 days" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      
      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;