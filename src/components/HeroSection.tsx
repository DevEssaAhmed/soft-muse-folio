import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, MessageCircle, MapPin, Calendar } from "lucide-react";
import profileAvatar from "@/assets/profile-avatar.jpg";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Instagram-style Profile Card */}
        <div className="bg-card rounded-3xl shadow-glow p-8 mb-8 animate-fade-up">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={profileAvatar}
                alt="Alex Chen"
                className="w-32 h-32 rounded-full shadow-soft border-4 border-primary/20"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-card"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-foreground">Alex Chen</h1>
                <Button 
                  size="sm" 
                  className="bg-gradient-primary hover:shadow-soft transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-3">
                <span>@alex_chen_data</span>
                <span>•</span>
                <span>Data Analyst Lead 2024</span>
              </div>

              <p className="text-foreground/90 mb-4 max-w-2xl">
                Senior Data Analyst | Python Expert | Tableau Specialist | Machine Learning Enthusiast
              </p>

              <p className="text-muted-foreground mb-6 max-w-2xl">
                Led 15+ successful projects • 500+ hours of data analysis • Building insights through beautiful visualizations 🚀
              </p>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">15+</div>
                  <div className="text-sm text-muted-foreground">Projects Led</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-muted-foreground">Hours Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">50+</div>
                  <div className="text-sm text-muted-foreground">Clients Served</div>
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined January 2022</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center md:justify-start gap-4 mt-6 pt-6 border-t border-border">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-all duration-300">
              <Github className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-all duration-300">
              <Linkedin className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-all duration-300">
              <Mail className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;