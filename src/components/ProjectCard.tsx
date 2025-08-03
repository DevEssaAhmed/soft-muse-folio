import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Github } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  demoUrl?: string;
  githubUrl?: string;
}

const ProjectCard = ({ title, description, image, tags, category, demoUrl, githubUrl }: ProjectCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-glow transition-all duration-300 hover:scale-[1.02] bg-white border-0 shadow-card">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-3 left-3 bg-white/90 text-secondary-foreground hover:bg-white"
        >
          {category}
        </Badge>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {githubUrl && (
            <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white">
              <Github className="w-4 h-4" />
            </Button>
          )}
          {demoUrl && (
            <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white">
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs border-primary/20 text-primary/80 hover:bg-primary/5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;