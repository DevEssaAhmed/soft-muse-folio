import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, Heart, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RecentArticlesProps {
  showAll?: boolean;
}

const RecentArticles = ({ showAll = false }: RecentArticlesProps) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(showAll ? 50 : 6);
      
      if (data) {
        setArticles(data);
        
        // Extract unique tags dynamically
        const allTags = data.flatMap(article => article.tags || []);
        const uniqueTags = [...new Set(allTags)];
        setTags(["All", ...uniqueTags]);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = selectedTag === "All" 
    ? articles.slice(0, 4)
    : articles.filter(article => article.tags?.includes(selectedTag)).slice(0, 4);

  if (loading) {
    return (
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12 animate-fade-up">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Latest Articles
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Insights, tutorials, and thoughts about data science and technology
            </p>
          </div>
          <Button 
            onClick={() => navigate("/articles")}
            className="hidden md:flex bg-gradient-primary hover:shadow-soft transition-all duration-300"
          >
            View All Articles
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Dynamic Tag Filters */}
        {tags.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-up delay-200">
            {tags.slice(0, 6).map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => setSelectedTag(tag)}
                className={`transition-all duration-300 ${
                  selectedTag === tag
                    ? "bg-gradient-primary shadow-soft scale-105"
                    : "hover:bg-primary/5 hover:border-primary/30"
                }`}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 animate-fade-up delay-300">
          {filteredArticles.map((article, index) => (
            <Card 
              key={article.id} 
              className="group hover:shadow-soft transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm border-primary/20"
              onClick={() => navigate(`/articles/${article.slug}`)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={article.image_url || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.created_at).toLocaleDateString()}
                  <Clock className="w-4 h-4 ml-2" />
                  {article.reading_time || 5} min read
                </div>
                <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {article.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View More Button (Mobile) */}
        <div className="text-center mt-12 md:hidden">
          <Button 
            onClick={() => navigate("/articles")}
            variant="outline" 
            size="lg"
            className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
          >
            View All Articles
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecentArticles;