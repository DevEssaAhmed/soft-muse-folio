import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tag, Search, Hash, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TagInfo {
  name: string;
  slug: string;
  count: number;
  articleCount: number;
  projectCount: number;
  trending?: boolean;
}

const TagsPage = () => {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  // const fetchTags = async () => {
  //   try {
  //     // Get all blog posts and projects to analyze tags
  //     const [{ data: blogPosts }, { data: projects }] = await Promise.all([
  //       supabase
  //         .from('blog_posts')
  //         .select('tags')
  //         .eq('published', true)
  //         .not('tags', 'is', null),
  //       supabase
  //         .from('projects')
  //         .select('tags')
  //         .not('tags', 'is', null)
  //     ]);

  //     // Count tags across content
  //     const tagCounts: { [key: string]: { articles: number; projects: number } } = {};
      
  //     // Count from blog posts
  //     blogPosts?.forEach(post => {
  //       if (post.tags) {
  //         post.tags.forEach((tag: string) => {
  //           if (!tagCounts[tag]) {
  //             tagCounts[tag] = { articles: 0, projects: 0 };
  //           }
  //           tagCounts[tag].articles++;
  //         });
  //       }
  //     });

  //     // Count from projects
  //     projects?.forEach(project => {
  //       if (project.tags) {
  //         project.tags.forEach((tag: string) => {
  //           if (!tagCounts[tag]) {
  //             tagCounts[tag] = { articles: 0, projects: 0 };
  //           }
  //           tagCounts[tag].projects++;
  //         });
  //       }
  //     });

  //     // Convert to TagInfo array
  //     const tagInfoArray: TagInfo[] = Object.entries(tagCounts)
  //       .map(([name, counts]) => ({
  //         name,
  //         slug: name.toLowerCase().replace(/\s+/g, '-'),
  //         count: counts.articles + counts.projects,
  //         articleCount: counts.articles,
  //         projectCount: counts.projects,
  //         trending: counts.articles + counts.projects >= 3 // Consider tags with 3+ items as trending
  //       }))
  //       .sort((a, b) => b.count - a.count);

  //     setTags(tagInfoArray);
  //   } catch (error) {
  //     console.error('Error fetching tags:', error);
  //     toast.error('Failed to load tags');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const fetchTags = async () => {
  try {
    // Get all tags and their counts in a single efficient query
    // This query uses a custom RPC function or a more complex query
    const { data: tagData, error: tagError } = await supabase.rpc('get_all_tags_with_counts');

    if (tagError) throw tagError;

    // The RPC function should return data in the format of your TagInfo[]
    // If not, you may need to map it here
    const tagInfoArray = tagData.map(tag => ({
      name: tag.name,
      slug: tag.name.toLowerCase().replace(/\s+/g, '-'),
      count: tag.total_count,
      articleCount: tag.article_count,
      projectCount: tag.project_count,
      trending: tag.total_count >= 3,
    })).sort((a, b) => b.count - a.count);

    setTags(tagInfoArray);

  } catch (error) {
    console.error('Error fetching tags:', error);
    toast.error('Failed to load tags');
  } finally {
    setLoading(false);
  }
};
  const handleTagClick = (slug: string) => {
    navigate(`/tags/${encodeURIComponent(slug)}`);
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trendingTags = filteredTags.filter(tag => tag.trending).slice(0, 12);
  const popularTags = filteredTags.slice(0, 24);
  const allTags = filteredTags;

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
      <SEO 
        title="Tags"
        description="Explore all tags across articles and projects. Find content by technology, topic, and skill."
        url="/tags"
      />
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Tag className="w-8 h-8 text-primary" />
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                All Tags
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Explore content by tags across articles and projects. Find exactly what you're looking for.
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <Hash className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{tags.length}</div>
                <div className="text-sm text-muted-foreground">Total Tags</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{trendingTags.length}</div>
                <div className="text-sm text-muted-foreground">Trending Tags</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Tag className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {tags.reduce((sum, tag) => sum + tag.count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Tagged Items</div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="trending" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="all">All Tags</TabsTrigger>
            </TabsList>

            <TabsContent value="trending">
              {trendingTags.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {trendingTags.map((tag) => (
                    <Card 
                      key={tag.slug}
                      className="group hover:shadow-glow transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                      onClick={() => handleTagClick(tag.slug)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold">
                              #
                            </div>
                            <div>
                              <CardTitle className="group-hover:text-primary transition-colors text-lg">
                                {tag.name}
                              </CardTitle>
                            </div>
                          </div>
                          <Badge className="bg-gradient-primary text-white">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm text-muted-foreground">
                            {tag.count} {tag.count === 1 ? 'item' : 'items'}
                          </div>
                          <Button size="sm" variant="ghost" className="group-hover:text-primary">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          {tag.articleCount > 0 && (
                            <span>{tag.articleCount} articles</span>
                          )}
                          {tag.projectCount > 0 && (
                            <span>{tag.projectCount} projects</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Trending Tags</h3>
                  <p className="text-muted-foreground">Tags will appear here as content gets more engagement.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="popular">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {popularTags.map((tag) => (
                  <Card 
                    key={tag.slug}
                    className="group hover:shadow-soft transition-all duration-300 cursor-pointer hover:border-primary/30"
                    onClick={() => handleTagClick(tag.slug)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                          #
                        </div>
                        <div className="flex-1">
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {tag.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-muted-foreground">
                          {tag.count} {tag.count === 1 ? 'item' : 'items'}
                        </div>
                        <Button size="sm" variant="ghost" className="group-hover:text-primary">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {tag.articleCount > 0 && (
                          <span>{tag.articleCount} articles</span>
                        )}
                        {tag.projectCount > 0 && (
                          <span>{tag.projectCount} projects</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="all">
              <div className="space-y-6">
                {/* Tag Cloud */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {allTags.slice(0, 50).map((tag) => (
                    <Badge
                      key={tag.slug}
                      variant="secondary"
                      className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors text-sm py-1 px-3"
                      onClick={() => handleTagClick(tag.slug)}
                      style={{
                        fontSize: Math.max(12, Math.min(16, 12 + (tag.count / Math.max(...allTags.map(t => t.count))) * 4)) + 'px'
                      }}
                    >
                      #{tag.name} ({tag.count})
                    </Badge>
                  ))}
                </div>

                {/* Detailed List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                  {allTags.map((tag) => (
                    <Card
                      key={tag.slug}
                      className="group hover:shadow-soft transition-all duration-300 cursor-pointer hover:border-primary/30 p-4"
                      onClick={() => handleTagClick(tag.slug)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-primary" />
                          <span className="font-medium group-hover:text-primary transition-colors">
                            {tag.name}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tag.count}
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        {tag.articleCount > 0 && <span>{tag.articleCount}a</span>}
                        {tag.projectCount > 0 && <span>{tag.projectCount}p</span>}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {allTags.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Tags Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms' : 'Tags will appear here once content is published.'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TagsPage;