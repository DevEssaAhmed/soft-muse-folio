import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Folder, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string | null;
  article_count: number;
  featured: boolean;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("featured", { ascending: false })
        .order("article_count", { ascending: false });
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (slug: string) => {
    navigate(`/categories/${slug}`);
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
              <Folder className="w-8 h-8 text-primary" />
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Categories
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore articles organized by topics and technologies. Find exactly what you're looking for.
            </p>
          </div>

          {/* Featured Categories */}
          {categories.some(cat => cat.featured) && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Featured Categories</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {categories.filter(category => category.featured).map((category) => (
                  <Card 
                    key={category.id}
                    className="group hover:shadow-glow transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                          style={{ backgroundColor: category.color || '#6366f1' }}
                        >
                          {category.icon || category.name.charAt(0).toUpperCase()}
                        </div>
                        <Badge className="bg-gradient-primary text-white">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors text-xl">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {category.description || `Explore ${category.name.toLowerCase()} articles and tutorials`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {category.article_count} {category.article_count === 1 ? 'article' : 'articles'}
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

          {/* All Categories */}
          <div>
            <h2 className="text-2xl font-bold mb-6">All Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.filter(category => !category.featured).map((category) => (
                <Card 
                  key={category.id}
                  className="group hover:shadow-soft transition-all duration-300 cursor-pointer hover:border-primary/30"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      >
                        {category.icon || category.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {category.name}
                        </CardTitle>
                      </div>
                    </div>
                    {category.description && (
                      <CardDescription className="text-sm mt-2">
                        {category.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {category.article_count} {category.article_count === 1 ? 'article' : 'articles'}
                      </div>
                      <Button size="sm" variant="ghost" className="group-hover:text-primary">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Categories Yet</h3>
                <p className="text-muted-foreground">Categories will appear here once articles are published.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoriesPage;