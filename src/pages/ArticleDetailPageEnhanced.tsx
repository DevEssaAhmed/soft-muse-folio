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

const ArticleDetailPageEnhanced = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [profile, setProfile] = useState<any>(null);

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
        setArticle(data);
        // Increment view count
        await supabase
          .from("blog_posts")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", data.id);
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
      const { data } = await supabase
        .from("profile")
        .select("*")
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleLike = async () => {
    if (!article) return;
    
    try {
      const newLikeCount = isLiked 
        ? (article.likes || 0) - 1 
        : (article.likes || 0) + 1;
      
      await supabase
        .from("blog_posts")
        .update({ likes: newLikeCount })
        .eq("id", article.id);
      
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
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
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
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Article Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    } else if (type === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      if (videoId) {
        return (
          <div className="relative w-full h-0 pb-[56.25%] mb-6">
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://player.vimeo.com/video/${videoId}`}
              title="Article Video"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    } else if (type === 'upload' && url) {
      return (
        <div className="mb-6">
          <video
            className="w-full rounded-lg"
            controls
            preload="metadata"
          >
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
            <Button onClick={() => navigate("/articles")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const readingTime = article.reading_time || calculateReadingTime(article.content);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ReadingProgress />
      
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/articles")}
              className="mb-6 hover:shadow-soft transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>

            {/* Article Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatReadingTime(readingTime)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {(article.views || 0) + 1} views
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {article.excerpt}
            </p>

            {/* Author Info */}
            {profile && (
              <div className="flex items-center gap-4 p-4 bg-card/30 rounded-xl border border-border/50 mb-8">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profile.avatar_url} alt={profile.name} />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {profile.name?.charAt(0) || <User className="w-5 h-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{profile.name}</h3>
                    {profile.title && (
                      <Badge variant="secondary" className="text-xs">
                        {profile.title}
                      </Badge>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  )}
                </div>
              </div>
            )}

            {/* Featured Image */}
            {article.image_url && (
              <div className="relative mb-8 rounded-2xl overflow-hidden shadow-soft">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-64 lg:h-96 object-cover"
                />
              </div>
            )}

            {/* Article Video Section */}
            {article.video_url && (
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-soft mb-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" />
                    Video Content
                  </h3>
                  {renderVideoEmbed(article.video_url, article.video_type || 'youtube')}
                </CardContent>
              </Card>
            )}

            {/* Additional Images Gallery */}
            {article.additional_images && article.additional_images.length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-soft mb-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Image Gallery
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {article.additional_images.map((imageUrl: string, index: number) => (
                      <Dialog key={index}>
                        <DialogTrigger asChild>
                          <div className="relative group cursor-pointer rounded-lg overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`Article image ${index + 1}`}
                              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <img
                            src={imageUrl}
                            alt={`Article image ${index + 1}`}
                            className="w-full h-auto rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <Button
                variant="outline"
                onClick={handleLike}
                className={`hover:shadow-soft transition-all duration-300 ${
                  isLiked ? 'text-red-500 border-red-500/50' : ''
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {article.likes || 0}
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="hover:shadow-soft transition-all duration-300"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Article Content */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-soft mb-8">
            <CardContent className="p-8 lg:p-12">
              <div className="space-y-6">
                {renderContent(article.content)}
              </div>
            </CardContent>
          </Card>

          {/* Article Footer */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {(article.views || 0) + 1} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {article.likes || 0} likes
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatReadingTime(readingTime)}
                  </div>
                </div>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="hover:shadow-soft transition-all duration-300"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Article
                </Button>
              </div>
              
              {profile && (
                <div>
                  <Separator className="mb-4" />
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={profile.avatar_url} alt={profile.name} />
                      <AvatarFallback className="bg-gradient-primary text-white text-lg">
                        {profile.name?.charAt(0) || <User className="w-6 h-6" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{profile.name}</h3>
                      {profile.title && (
                        <p className="text-primary font-medium mb-2">{profile.title}</p>
                      )}
                      {profile.bio && (
                        <p className="text-muted-foreground">{profile.bio}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        {profile.website_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                              Website
                            </a>
                          </Button>
                        )}
                        {profile.github_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                              GitHub
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ScrollToTop />
    </div>
  );
};

export default ArticleDetailPageEnhanced;