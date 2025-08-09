import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ExternalLink, Github, Calendar, Eye, Heart, MessageSquare, Star, Share, Play, Image as ImageIcon, Maximize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { YooptaContentValue, createYooptaEditor } from '@yoopta/editor';
import { markdown as yooptaMarkdown } from '@yoopta/exports';

function tryConvertYooptaToMarkdown(content: string): string {
  try {
    const json = JSON.parse(content) as YooptaContentValue;
    if (!json || typeof json !== 'object') return content;
    const editor = createYooptaEditor();
    const md = yooptaMarkdown.serialize(editor, json) || '';
    return md || content;
  } catch {
    return content;
  }
}

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
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error) throw error;
      if (data) {
        const md = data.description ? tryConvertYooptaToMarkdown(data.description) : '';
        setProject({ ...data, description: md });
        await supabase.from("projects").update({ views: (data.views || 0) + 1 }).eq("id", data.id);
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
      const newLikeCount = isLiked ? (project.likes || 0) - 1 : (project.likes || 0) + 1;
      await supabase.from("projects").update({ likes: newLikeCount }).eq("id", project.id);
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
      navigator.share({ title: project.title, text: project.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
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

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Project not found</h2>
            <Button onClick={() => navigate("/projects")}> <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects </Button>
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
          <Button variant="ghost" onClick={() => navigate("/projects")} className="mb-6 hover:shadow-soft transition-all duration-300"> <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects </Button>
          {project.image_url &amp;&amp; (
            <div className="relative mb-8 rounded-2xl overflow-hidden shadow-glow">
              <img src={project.image_url} alt={project.title} className="w-full h-64 lg:h-96 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {project.featured &amp;&amp; (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-primary text-white shadow-soft"> <Star className="w-3 h-3 mr-1" /> Featured </Badge>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(project.created_at).toLocaleDateString()}</div>
            <div className="flex items-center gap-1"><Eye className="w-4 h-4" />{(project.views || 0) + 1} views</div>
            <div className="flex items-center gap-1"><Heart className="w-4 h-4" />{project.likes || 0} likes</div>
          </div>
          <div className="mb-6">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">{project.title}</h1>
          </div>
          <div className="prose prose-lg max-w-none mb-12">
            <MarkdownRenderer content={project.description || ''} />
          </div>
          <div className="flex items-center gap-3 mb-8">
            {project.demo_url &amp;&amp; (
              <Button onClick={() => window.open(project.demo_url, '_blank')} className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                <ExternalLink className="w-4 h-4 mr-2" /> Live Demo
              </Button>
            )}
            {project.github_url &amp;&amp; (
              <Button onClick={() => window.open(project.github_url, '_blank')} variant="outline">
                <Github className="w-4 h-4 mr-2" /> GitHub
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;