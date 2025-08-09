import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  Share,
  MessageSquare,
  User,
  Play,
  Image as ImageIcon,
  Maximize2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ScrollToTop from "@/components/blog/ScrollToTop";
import ReadingProgress from "@/components/blog/ReadingProgress";
import { calculateReadingTime, formatReadingTime } from "@/utils/readingTime";
import { YooptaContentValue, createYooptaEditor } from '@yoopta/editor';
import { markdown as yooptaMarkdown } from '@yoopta/exports';

function tryConvertYooptaToMarkdown(content: string): string {
  try {
    const json = JSON.parse(content) as YooptaContentValue;
    if (!json || typeof json !== 'object') return content;
    const editor = createYooptaEditor();
    const md = yooptaMarkdown.serialize(editor, json) || '';
    return md || content;
  } catch {
    return content;
  }
}

const ArticleDetailPageEnhanced = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const handleTagClick = (tag: string) => {
    const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
    navigate(`/tags/${encodeURIComponent(tagSlug)}`);
  };

  useEffect(() => {
    if (slug) {
      fetchArticle();
      fetchProfile();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (error) throw error;
      if (data) {
        // Convert JSON content to Markdown for rendering if needed
        const markdownContent = tryConvertYooptaToMarkdown(data.content);
        setArticle({ ...data, content: markdownContent });
        await supabase.from("blog_posts").update({ views: (data.views || 0) + 1 }).eq("id", data.id);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Article not found");
      navigate("/articles");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from("profile").select("*").single();
      if (data) setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleLike = async () => {
    if (!article) return;
    try {
      const newLikeCount = isLiked ? (article.likes || 0) - 1 : (article.likes || 0) + 1;
      await supabase.from("blog_posts").update({ likes: newLikeCount }).eq("id", article.id);
      setArticle({ ...article, likes: newLikeCount });
      setIsLiked(!isLiked);
      toast.success(isLiked ? "Like removed" : "Article liked!");
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, text: article.excerpt, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const renderVideoEmbed = (url: string, type: string) => {
    if (!url) return null;
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        return (
          <div className="relative w-full h-0 pb-[56.25%] mb-6">
            <iframe className="absolute top-0 left-0 w-full h-full rounded-lg" src={`https://www.youtube.com/embed/${videoId}`} title="Article Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        );
      }
    } else if (type === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      if (videoId) {
        return (
          <div className="relative w-full h-0 pb-[56.25%] mb-6">
            <iframe className="absolute top-0 left-0 w-full h-full rounded-lg" src={`https://player.vimeo.com/video/${videoId}`} title="Article Video" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          </div>
        );
      }
    } else if (type === 'upload' && url) {
      return (
        <div className="mb-6">
          <video className="w-full rounded-lg" controls preload="metadata">
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    return null;
  };

  const renderContent = (content: string) => {
    return <MarkdownRenderer content={content} className="prose prose-lg max-w-none" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Article not found</h2>
            <Button onClick={() => navigate("/articles")}> <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles </Button>
          </div>
        </div>
      </div>
    );
  }

  const rt = calculateReadingTime(article.content);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ReadingProgress />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Button variant="ghost" onClick={() => navigate("/articles")} className="mb-6 hover:shadow-soft transition-all duration-300"> <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles </Button>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatReadingTime(rt)}</div>
            <div className="flex items-center gap-1"><Eye className="w-4 h-4" />{(article.views || 0) + 1} views</div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">{article.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">{article.excerpt}</p>
          {article.video_url && renderVideoEmbed(article.video_url, article.video_type)}
          <div className="mb-8">{renderContent(article.content)}</div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPageEnhanced;