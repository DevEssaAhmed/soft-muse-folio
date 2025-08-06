import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 Component
const GoogleAnalytics = () => {
  const location = useLocation();
  
  // Replace with your actual GA4 Measurement ID
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

  useEffect(() => {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });

      // Make gtag available globally
      (window as any).gtag = gtag;
    };

    return () => {
      // Cleanup script on unmount
      document.head.removeChild(script);
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if ((window as any).gtag) {
      (window as any).gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
};

// Analytics event tracking utilities
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

export const trackPageView = (path: string, title?: string) => {
  if ((window as any).gtag) {
    (window as any).gtag('config', 'G-XXXXXXXXXX', {
      page_path: path,
      page_title: title || document.title,
    });
  }
};

// Specific event tracking functions
export const trackArticleRead = (articleTitle: string, category?: string) => {
  trackEvent('article_read', {
    article_title: articleTitle,
    category: category,
  });
};

export const trackProjectView = (projectTitle: string, category?: string) => {
  trackEvent('project_view', {
    project_title: projectTitle,
    category: category,
  });
};

export const trackContactForm = (purpose: string) => {
  trackEvent('contact_form_submit', {
    form_purpose: purpose,
  });
};

export const trackDownload = (fileName: string, fileType: string) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
  });
};

export const trackSearch = (searchTerm: string, searchType: string) => {
  trackEvent('search', {
    search_term: searchTerm,
    search_type: searchType,
  });
};

export const trackSocialShare = (platform: string, contentType: string, contentTitle: string) => {
  trackEvent('share', {
    method: platform,
    content_type: contentType,
    content_id: contentTitle,
  });
};

export default GoogleAnalytics;