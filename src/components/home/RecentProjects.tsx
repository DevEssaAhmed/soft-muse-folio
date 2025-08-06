import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, Heart, ExternalLink, Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RecentProjectsProps {
  showAll?: boolean;
}

const RecentProjects = ({ showAll = false }: RecentProjectsProps) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
    navigate(`/tags/${encodeURIComponent(tagSlug)}`);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(showAll ? 50 : 6);
      
      if (data) {
        setProjects(data);
        
        // Extract unique categories dynamically
        const uniqueCategories = [...new Set(data.map(project => project.category))];
        setCategories(["All", ...uniqueCategories]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = selectedCategory === "All" 
    ? projects.slice(0, showAll ? projects.length : 4)
    : projects.filter(project => project.category === selectedCategory).slice(0, showAll ? projects.length : 4);

  if (loading) {
    return (
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12 animate-fade-up">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Recent Projects
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover my latest work in data analysis, visualization, and machine learning
            </p>
          </div>
          <Button 
            onClick={() => navigate("/projects")}
            className="hidden md:flex bg-gradient-primary hover:shadow-soft transition-all duration-300"
          >
            View All Projects
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Dynamic Category Filters */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-up delay-200">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-primary shadow-soft scale-105"
                    : "hover:bg-primary/5 hover:border-primary/30"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        {/* Projects Grid */}
        <div className={`grid md:grid-cols-2 ${showAll ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8 animate-fade-up delay-300`}>
          {filteredProjects.map((project, index) => (
            <Card 
              key={project.id} 
              className="group hover:shadow-soft transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm border-primary/20"
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={project.image_url || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {project.featured && (
                  <Badge className="absolute top-3 left-3 bg-gradient-primary">
                    Featured
                  </Badge>
                )}
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="mb-2 w-fit">
                    {project.category}
                  </Badge>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                  {project.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {project.views || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {project.likes || 0}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {project.demo_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(project.demo_url, '_blank');
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                    {project.github_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(project.github_url, '_blank');
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <Github className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View More Button (Mobile) */}
        <div className="text-center mt-12 md:hidden">
          <Button 
            onClick={() => navigate("/projects")}
            variant="outline" 
            size="lg"
            className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
          >
            View All Projects
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecentProjects;