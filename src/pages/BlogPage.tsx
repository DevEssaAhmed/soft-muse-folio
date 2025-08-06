import Navigation from "../components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar, Clock, Eye, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with Data Visualization in React",
      excerpt: "Learn how to create beautiful and interactive data visualizations using React and D3.js. This comprehensive guide covers everything from basic charts to complex dashboards.",
      content: "",
      image: "/placeholder.svg",
      tags: ["React", "D3.js", "Data Viz"],
      publishedAt: "2024-01-15",
      readingTime: 8,
      views: 1234,
      likes: 56
    },
    {
      id: 2,
      title: "Machine Learning Pipeline Best Practices",
      excerpt: "Discover the essential best practices for building robust and scalable machine learning pipelines. From data preprocessing to model deployment.",
      content: "",
      image: "/placeholder.svg",
      tags: ["Machine Learning", "Python", "MLOps"],
      publishedAt: "2024-01-10",
      readingTime: 12,
      views: 987,
      likes: 43
    },
    {
      id: 3,
      title: "Advanced SQL Techniques for Data Analysis",
      excerpt: "Master advanced SQL techniques that will make your data analysis more efficient and powerful. Window functions, CTEs, and performance optimization.",
      content: "",
      image: "/placeholder.svg",
      tags: ["SQL", "Data Analysis", "Database"],
      publishedAt: "2024-01-05",
      readingTime: 10,
      views: 876,
      likes: 38
    },
    {
      id: 4,
      title: "Building Real-time Dashboards with React",
      excerpt: "Step-by-step guide to building real-time dashboards that update automatically with live data streams using React and WebSockets.",
      content: "",
      image: "/placeholder.svg",
      tags: ["React", "Real-time", "Dashboard"],
      publishedAt: "2024-01-01",
      readingTime: 15,
      views: 654,
      likes: 29
    },
    {
      id: 5,
      title: "Data Science Project Structure",
      excerpt: "Learn how to organize your data science projects for maximum productivity and reproducibility. Templates and best practices included.",
      content: "",
      image: "/placeholder.svg",
      tags: ["Data Science", "Project Management", "Python"],
      publishedAt: "2023-12-28",
      readingTime: 6,
      views: 543,
      likes: 22
    },
    {
      id: 6,
      title: "API Design for Data Applications",
      excerpt: "Best practices for designing APIs that serve data applications effectively. Performance, security, and scalability considerations.",
      content: "",
      image: "/placeholder.svg",
      tags: ["API", "Backend", "Node.js"],
      publishedAt: "2023-12-25",
      readingTime: 9,
      views: 432,
      likes: 18
    }
  ];

  const categories = ["All", "Data Science", "Web Development", "Machine Learning", "Tutorials"];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and thoughts on data science, web development, and technology
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        {blogPosts.length > 0 && (
          <Card className="mb-12 hover:shadow-lg transition-shadow">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-64 md:h-full object-cover rounded-l-lg"
                />
                <Badge className="absolute top-4 left-4">Featured</Badge>
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(blogPosts[0].publishedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {blogPosts[0].readingTime} min read
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3">{blogPosts[0].title}</h2>
                  <p className="text-muted-foreground mb-4">{blogPosts[0].excerpt}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blogPosts[0].tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {blogPosts[0].views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {blogPosts[0].likes}
                    </span>
                  </div>
                  <Button asChild>
                    <Link to={`/blog/${blogPosts[0].id}`}>
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow group">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardHeader>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readingTime} min
                  </span>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/blog/${post.id}`}>
                      Read More
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  );
}