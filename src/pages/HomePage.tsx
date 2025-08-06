import Navigation from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const skills = ["React", "TypeScript", "Node.js", "Python", "SQL", "Data Analysis"];
  const recentProjects = [
    {
      title: "Data Visualization Dashboard",
      description: "Interactive dashboard for business analytics",
      tech: ["React", "D3.js", "TypeScript"]
    },
    {
      title: "Machine Learning Pipeline",
      description: "Automated ML pipeline for predictive analytics",
      tech: ["Python", "Scikit-learn", "Docker"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Hi, I'm <span className="text-primary">John Doe</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Full-stack developer and data analyst passionate about creating 
            meaningful digital experiences through code and data insights.
          </p>
          
          {/* Skills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg">
              <Link to="/projects">
                View Projects
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/about">
                About Me
              </Link>
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4">
            <Button variant="ghost" size="icon">
              <Github className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Linkedin className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Mail className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Recent Projects</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {recentProjects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild>
              <Link to="/projects">View All Projects</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}