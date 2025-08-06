import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Github, Heart, MessageCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  demoUrl?: string;
  githubUrl?: string;
  views: number;
  likes: number;
  comments: number;
}

const ProjectCard = ({ id, title, description, image, tags, category, demoUrl, githubUrl, views, likes, comments }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleProjectClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/projects/${id}`);
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (demoUrl) {
      window.open(demoUrl, '_blank');
    }
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    // For now, we'll navigate to a 404 page as requested
    // In the future, this could navigate to a tags page
    navigate('/404-tag-not-found');
  };

  return (
    <Card 
      className="group overflow-hidden bg-card shadow-card hover:shadow-glow transition-all duration-300 aspect-square relative cursor-pointer"
      onClick={handleProjectClick}
    >
      <div className="relative h-full">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Instagram-style overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-white/90 mb-4 line-clamp-3">{description}</p>
            
            {/* Instagram-style engagement metrics */}
            <div className="flex justify-center gap-6 mb-4">
              <div className="flex items-center gap-1">
                <Heart className="w-5 h-5 fill-white" />
                <span className="text-sm font-medium">{likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{comments}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">{views}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-2">
              {githubUrl && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={handleCodeClick}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Code
                </Button>
              )}
              {demoUrl && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={handleDemoClick}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Demo
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom info bar - always visible */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {category}
            </Badge>
            <div className="flex gap-2">
              {tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-white/10 text-white border-white/30 backdrop-blur-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;