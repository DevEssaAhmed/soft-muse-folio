import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const dummyArticles = [
  {
    id: 1,
    title: "Building Predictive Models with Python",
    excerpt: "A comprehensive guide to creating robust machine learning models using Python and scikit-learn.",
    content: "Full article content here...",
    tags: ["Python", "Machine Learning", "Data Science"],
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    published: true,
    views: 1245,
    likes: 89,
    reading_time: 8,
    created_at: "2024-01-15T10:00:00Z",
    slug: "building-predictive-models-python"
  },
  {
    id: 2,
    title: "Data Visualization Best Practices",
    excerpt: "Learn how to create compelling and informative data visualizations that tell a story.",
    content: "Full article content here...",
    tags: ["Visualization", "Tableau", "Design"],
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    published: true,
    views: 892,
    likes: 67,
    reading_time: 6,
    created_at: "2024-01-20T14:30:00Z",
    slug: "data-visualization-best-practices"
  },
  {
    id: 3,
    title: "Customer Segmentation with K-Means",
    excerpt: "Implementing customer segmentation using K-means clustering algorithm for targeted marketing.",
    content: "Full article content here...",
    tags: ["Clustering", "Marketing", "Analytics"],
    image_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=400&fit=crop",
    published: true,
    views: 1156,
    likes: 94,
    reading_time: 10,
    created_at: "2024-01-25T09:15:00Z",
    slug: "customer-segmentation-kmeans"
  }
];

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      
      if (data && data.length > 0) {
        setArticles(data);
      } else {
        setArticles(dummyArticles);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      setArticles(dummyArticles);
    }
  };

  const allTags = ["All", ...new Set(articles.flatMap(article => article.tags || []))];
  const filteredArticles = selectedTag === "All" 
    ? articles 
    : articles.filter(article => article.tags?.includes(selectedTag));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Articles & Insights
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thoughts, tutorials, and insights about data science, analytics, and technology
            </p>
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {allTags.map((tag) => (
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

          {/* Articles grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <Card 
                key={article.id} 
                className="group hover:shadow-soft transition-all duration-300 cursor-pointer"
                onClick={() => window.location.href = `/articles/${article.slug}`}
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
                    {article.reading_time} min read
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription>
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {article.likes}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;