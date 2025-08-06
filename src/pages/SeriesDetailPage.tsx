import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Eye, Heart, BookOpen, CheckCircle, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SeriesDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchSeriesAndArticles();
    }
  }, [slug]);

  const fetchSeriesAndArticles = async () => {
    try {
      // Fetch series
      const { data: seriesData, error: seriesError } = await supabase
        .from("series")
        .select("*")
        .eq("slug", slug)
        .single();

      if (seriesError) throw seriesError;
      setSeries(seriesData);

      // Fetch articles in this series
      const { data: articlesData, error: articlesError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("series_id", seriesData.id)
        .eq("published", true)
        .order("series_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error("Series not found");
      navigate("/series");
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (articleSlug: string) => {
    navigate(`/articles/${articleSlug}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'on-hold':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed Series';
      case 'on-hold':
        return 'Series On Hold';
      default:
        return 'Active Series';
    }
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

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Series not found</h2>
            <Button onClick={() => navigate("/series")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Series
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/series")}
              className="mb-6 hover:shadow-soft transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Series
            </Button>

            {/* Featured Image */}
            {(series.featured_image_url || series.image_url) && (
              <div className="relative mb-8 rounded-2xl overflow-hidden shadow-glow">
                <img
                  src={series.featured_image_url || series.image_url}
                  alt={series.title}
                  className="w-full h-64 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-2">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(series.status)}
                      {getStatusText(series.status)}
                    </span>
                  </Badge>
                </div>
              </div>
            )}

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {series.title}
                </h1>
              </div>
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Started {new Date(series.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(series.status)}
                  {getStatusText(series.status)}
                </div>
              </div>

              {series.description && (
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
                  {series.description}
                </p>
              )}

              {/* Tags */}
              {series.tags && series.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {series.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full border">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {series.article_count} {series.article_count === 1 ? 'Article' : 'Articles'}
                </span>
              </div>
            </div>
          </div>

          {/* Articles */}
          {articles.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">Articles in this Series</h2>
              <div className="space-y-6">
                {articles.map((article, index) => (
                  <Card 
                    key={article.id} 
                    className="group hover:shadow-soft transition-all duration-300 cursor-pointer"
                    onClick={() => handleArticleClick(article.slug)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Order Number */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-primary text-white font-bold text-lg flex items-center justify-center">
                            {article.series_order || index + 1}
                          </div>
                        </div>

                        {/* Article Image */}
                        {article.image_url && (
                          <div className="flex-shrink-0 hidden md:block">
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        {/* Article Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.created_at).toLocaleDateString()}
                            <Clock className="w-4 h-4 ml-2" />
                            {article.reading_time || 5} min read
                          </div>
                          
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">
                            {article.title}
                          </h3>
                          
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {article.tags?.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {article.views || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {article.likes || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Articles Yet</h3>
              <p className="text-muted-foreground">
                Articles in the {series.title} series will appear here once they're published.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SeriesDetailPage;