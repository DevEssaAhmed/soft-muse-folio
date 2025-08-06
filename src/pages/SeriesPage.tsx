import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ArrowRight, Sparkles, Clock, CheckCircle, Pause } from "lucide-react";
import { toast } from "sonner";

interface Series {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  featured_image_url: string | null;
  tags: string[];
  article_count: number;
  featured: boolean;
  status: string;
  created_at: string;
}

const SeriesPage = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setSeries(data || []);
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error("Failed to load series");
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesClick = (slug: string) => {
    navigate(`/series/${slug}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'on-hold':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'on-hold':
        return 'On Hold';
      default:
        return 'Active';
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Article Series
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dive deep into comprehensive article series. Follow structured learning paths and master complex topics step by step.
            </p>
          </div>

          {/* Featured Series */}
          {series.some(s => s.featured) && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Featured Series</h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {series.filter(s => s.featured).map((seriesItem) => (
                  <Card 
                    key={seriesItem.id}
                    className="group hover:shadow-glow transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                    onClick={() => handleSeriesClick(seriesItem.slug)}
                  >
                    {(seriesItem.featured_image_url || seriesItem.image_url) && (
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={seriesItem.featured_image_url || seriesItem.image_url || "/placeholder.svg"}
                          alt={seriesItem.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-primary text-white shadow-soft">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <Badge variant="secondary" className="bg-black/50 text-white border-white/20 backdrop-blur-sm">
                            <span className="flex items-center gap-1">
                              {getStatusIcon(seriesItem.status)}
                              {getStatusText(seriesItem.status)}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(seriesItem.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </div>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors text-xl">
                        {seriesItem.title}
                      </CardTitle>
                      <CardDescription>
                        {seriesItem.description || `A comprehensive series about ${seriesItem.title.toLowerCase()}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Tags */}
                      {seriesItem.tags && seriesItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {seriesItem.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {seriesItem.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{seriesItem.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {seriesItem.article_count} {seriesItem.article_count === 1 ? 'article' : 'articles'}
                        </div>
                        <Button size="sm" variant="ghost" className="group-hover:text-primary">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Series */}
          <div>
            <h2 className="text-2xl font-bold mb-6">All Series</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {series.filter(s => !s.featured).map((seriesItem) => (
                <Card 
                  key={seriesItem.id}
                  className="group hover:shadow-soft transition-all duration-300 cursor-pointer hover:border-primary/30"
                  onClick={() => handleSeriesClick(seriesItem.slug)}
                >
                  {(seriesItem.featured_image_url || seriesItem.image_url) && (
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={seriesItem.featured_image_url || seriesItem.image_url || "/placeholder.svg"}
                        alt={seriesItem.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-black/50 text-white border-white/20 backdrop-blur-sm text-xs">
                          <span className="flex items-center gap-1">
                            {getStatusIcon(seriesItem.status)}
                            {getStatusText(seriesItem.status)}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      {new Date(seriesItem.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {seriesItem.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {seriesItem.description?.slice(0, 100)}
                      {seriesItem.description && seriesItem.description.length > 100 && "..."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Tags */}
                    {seriesItem.tags && seriesItem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {seriesItem.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {seriesItem.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{seriesItem.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {seriesItem.article_count} {seriesItem.article_count === 1 ? 'article' : 'articles'}
                      </div>
                      <Button size="sm" variant="ghost" className="group-hover:text-primary">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {series.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Series Yet</h3>
                <p className="text-muted-foreground">Article series will appear here once they're published.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SeriesPage;