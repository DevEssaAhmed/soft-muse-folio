import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search, Filter, Calendar, Eye, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

interface Tag {
  name: string;
  count: number;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published: boolean;
  created_at: string;
  tags: string[];
  views?: number;
  likes?: number;
  image_url?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  created_at: string;
  views?: number;
  likes?: number;
  image_url?: string;
  demo_url?: string;
  github_url?: string;
}

const TagDetailPage: React.FC = () => {
  const { tagSlug } = useParams<{ tagSlug: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagName, setTagName] = useState('');
  const [relatedTags, setRelatedTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (tagSlug) {
      fetchTagContent();
    }
  }, [tagSlug]);

  const fetchTagContent = async () => {
    if (!tagSlug) return;
    
    setLoading(true);
    try {
      // Decode the tag name from slug
      const decodedTag = decodeURIComponent(tagSlug.replace(/-/g, ' '));
      setTagName(decodedTag);

      // Fetch blog posts with this tag
      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('*')
        .contains('tags', [decodedTag])
        .eq('published', true)
        .order('created_at', { ascending: false });

      // Fetch projects with this tag
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .contains('tags', [decodedTag])
        .order('created_at', { ascending: false });

      setBlogPosts(blogData || []);
      setProjects(projectData || []);

      // Generate related tags based on content with the same tag
      await fetchRelatedTags(decodedTag);
      
    } catch (error) {
      console.error('Error fetching tag content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTags = async (currentTag: string) => {
    try {
      // Get all blog posts and projects to analyze tags
      const { data: allBlogPosts } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('published', true);

      const { data: allProjects } = await supabase
        .from('projects')
        .select('tags');

      // Combine and count all tags, excluding the current tag
      const tagCounts: { [key: string]: number } = {};
      
      [...(allBlogPosts || []), ...(allProjects || [])].forEach(item => {
        if (item.tags && item.tags.includes(currentTag)) {
          item.tags.forEach((tag: string) => {
            if (tag !== currentTag) {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
          });
        }
      });

      // Convert to array and sort by count
      const relatedTagsArray = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 related tags

      setRelatedTags(relatedTagsArray);
    } catch (error) {
      console.error('Error fetching related tags:', error);
    }
  };

  const handleTagClick = (tag: string) => {
    const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
    navigate(`/tags/${encodeURIComponent(tagSlug)}`);
  };

  const filteredBlogPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tag content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="self-start sm:self-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                #{tagName}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {blogPosts.length + projects.length} items tagged with "{tagName}"
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search within tagged content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="all">All ({blogPosts.length + projects.length})</TabsTrigger>
            <TabsTrigger value="articles">Articles ({blogPosts.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {/* All Content */}
            <div className="grid gap-6">
              {/* Blog Posts */}
              {filteredBlogPosts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Articles</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBlogPosts.map((post) => (
                      <Card key={post.id} className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={() => navigate(`/articles/${post.slug}`)}>
                        {post.image_url && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                            {post.views && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.views}
                              </div>
                            )}
                            {post.likes && (
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.likes}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {post.tags?.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags && post.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {filteredProjects.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Projects</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                        {project.image_url && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img
                              src={project.image_url}
                              alt={project.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{project.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.created_at).toLocaleDateString()}
                            </div>
                            {project.views && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {project.views}
                              </div>
                            )}
                            {project.likes && (
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {project.likes}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {project.tags?.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags && project.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {filteredBlogPosts.length === 0 && filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <Filter className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No content found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : `No content tagged with "${tagName}"`}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="articles">
            {filteredBlogPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBlogPosts.map((post) => (
                  <Card key={post.id} className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={() => navigate(`/articles/${post.slug}`)}>
                    {post.image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                        {post.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views}
                          </div>
                        )}
                        {post.likes && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags && post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Filter className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No articles found</h3>
                <p className="text-sm text-muted-foreground">No articles are tagged with "{tagName}"</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects">
            {filteredProjects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                    {project.image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{project.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                        {project.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {project.views}
                          </div>
                        )}
                        {project.likes && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {project.likes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {project.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags && project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Filter className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects found</h3>
                <p className="text-sm text-muted-foreground">No projects are tagged with "{tagName}"</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Related Tags */}
        {relatedTags.length > 0 && (
          <Card className="mt-12 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Related Tags</CardTitle>
              <CardDescription>Other tags commonly used with "{tagName}"</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {relatedTags.map((tag) => (
                  <Badge
                    key={tag.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleTagClick(tag.name)}
                  >
                    {tag.name} ({tag.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TagDetailPage;