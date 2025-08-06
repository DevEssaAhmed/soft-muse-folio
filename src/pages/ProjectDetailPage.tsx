import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  Calendar, 
  Eye, 
  Heart, 
  MessageSquare,
  Star,
  Share,
  Play,
  Image as ImageIcon,
  Maximize2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const handleTagClick = (tag: string) => {
    const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
    navigate(`/tags/${encodeURIComponent(tagSlug)}`);
  };

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProject(data);
        // Increment view count
        await supabase
          .from("projects")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", data.id);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Project not found");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!project) return;
    
    try {
      const newLikeCount = isLiked 
        ? (project.likes || 0) - 1 
        : (project.likes || 0) + 1;
      
      await supabase
        .from("projects")
        .update({ likes: newLikeCount })
        .eq("id", project.id);
      
      setProject({ ...project, likes: newLikeCount });
      setIsLiked(!isLiked);
      
      toast.success(isLiked ? "Like removed" : "Project liked!");
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
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
              title="Demo Video"
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
              title="Demo Video"
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

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Project not found</h2>
            <Button onClick={() => navigate("/projects")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
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
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/projects")}
              className="mb-6 hover:shadow-soft transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>

            {/* Featured Image */}
            {project.image_url && (
              <div className="relative mb-8 rounded-2xl overflow-hidden shadow-glow">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-64 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {project.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-primary text-white shadow-soft">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Project Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(project.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {(project.views || 0) + 1} views
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {project.likes || 0} likes
              </div>
            </div>

            {/* Title and Category */}
            <div className="mb-6">
              <Badge variant="secondary" className="mb-3">
                {project.category}
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                {project.title}
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              {project.demo_url && (
                <Button
                  onClick={() => window.open(project.demo_url, '_blank')}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Demo
                </Button>
              )}
              {project.github_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(project.github_url, '_blank')}
                  className="hover:shadow-soft transition-all duration-300"
                >
                  <Github className="w-4 h-4 mr-2" />
                  View Code
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleLike}
                className={`hover:shadow-soft transition-all duration-300 ${
                  isLiked ? 'text-red-500 border-red-500/50' : ''
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {project.likes || 0}
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
          </div>

          {/* Project Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Demo Video Section */}
              {project.demo_video_url && (
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-soft">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Play className="w-6 h-6 text-primary" />
                      Demo Video
                    </h2>
                    {renderVideoEmbed(project.demo_video_url, project.demo_video_type || 'youtube')}
                  </CardContent>
                </Card>
              )}

              {/* Additional Images Section */}
              {project.additional_images && project.additional_images.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-soft">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <ImageIcon className="w-6 h-6 text-primary" />
                      Project Gallery
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {project.additional_images.map((imageUrl: string, index: number) => (
                        <Dialog key={index}>
                          <DialogTrigger asChild>
                            <div className="relative group cursor-pointer rounded-lg overflow-hidden">
                              <img
                                src={imageUrl}
                                alt={`Project image ${index + 1}`}
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
                              alt={`Project image ${index + 1}`}
                              className="w-full h-auto rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Description */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-soft">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">About This Project</h2>
                  <div className="prose prose-lg max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap leading-relaxed">{project.description}</p>
                  </div>
                  
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Technologies Used</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag: string) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="px-3 py-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                            onClick={() => handleTagClick(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Stats */}
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20 shadow-soft">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Project Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Views</span>
                      </div>
                      <span className="font-medium">{(project.views || 0) + 1}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Likes</span>
                      </div>
                      <span className="font-medium">{project.likes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Comments</span>
                      </div>
                      <span className="font-medium">{project.comments || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Actions */}
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20 shadow-soft">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Actions</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={handleLike}
                      variant={isLiked ? "default" : "outline"}
                      className="w-full justify-start"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like Project'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="w-full justify-start"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;