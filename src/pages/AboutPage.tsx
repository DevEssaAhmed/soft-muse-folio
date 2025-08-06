import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, MapPin } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-16">
            <img
              src="/src/assets/profile-avatar.jpg"
              alt="Alex Chen"
              className="w-32 h-32 rounded-full mx-auto mb-8 border-4 border-primary/20"
            />
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              About Alex Chen
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Data Scientist & Analytics Engineer passionate about turning data into actionable insights
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">My Story</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      I'm a passionate data scientist with over 5 years of experience in transforming complex data 
                      into meaningful insights. My journey began with a degree in Statistics and Computer Science, 
                      which laid the foundation for my analytical thinking and technical skills.
                    </p>
                    <p>
                      Throughout my career, I've worked across various industries including finance, healthcare, 
                      and e-commerce, helping organizations make data-driven decisions that drive growth and 
                      efficiency. I specialize in machine learning, statistical analysis, and data visualization.
                    </p>
                    <p>
                      When I'm not analyzing data, you can find me contributing to open-source projects, 
                      writing technical articles, or exploring the latest developments in AI and machine learning.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-sm">alex.chen@email.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm">San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Github className="w-4 h-4 text-primary" />
                      <span className="text-sm">github.com/alexchen</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Linkedin className="w-4 h-4 text-primary" />
                      <span className="text-sm">linkedin.com/in/alexchen</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Python", "R", "SQL", "Tableau", "Machine Learning", "Statistics", "Data Visualization", "Pandas", "Scikit-learn"].map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
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

export default AboutPage;