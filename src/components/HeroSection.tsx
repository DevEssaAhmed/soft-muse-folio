import { Button } from "@/components/ui/button";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import profileAvatar from "@/assets/profile-avatar.jpg";
import heroDataViz from "@/assets/hero-data-viz.jpg";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-20">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8 animate-fade-up">
          <div className="flex items-center gap-4">
            <img
              src={profileAvatar}
              alt="Profile"
              className="w-20 h-20 rounded-full shadow-soft border-4 border-white/50"
            />
            <div>
              <h2 className="text-lg font-medium text-foreground/80">Hello, I'm</h2>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Alex Chen
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl lg:text-3xl font-semibold text-foreground">
              Data Analyst & Storyteller
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Transforming complex data into beautiful insights and compelling stories. 
              I specialize in creating interactive visualizations that drive business decisions 
              and uncover hidden patterns in data.
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              View My Work
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary/30 hover:bg-primary/5 transition-all duration-300"
            >
              Get In Touch
            </Button>
          </div>

          <div className="flex gap-6 pt-4">
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

        {/* Right Content */}
        <div className="relative animate-fade-up delay-200">
          <div className="relative rounded-2xl overflow-hidden shadow-glow">
            <img
              src={heroDataViz}
              alt="Data Visualization Dashboard"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-primary/10"></div>
          </div>
          
          {/* Floating badges */}
          <div className="absolute -top-4 -left-4 bg-white rounded-lg p-3 shadow-card animate-scale-in delay-500">
            <div className="text-sm font-semibold text-primary">Python</div>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-white rounded-lg p-3 shadow-card animate-scale-in delay-700">
            <div className="text-sm font-semibold text-secondary-foreground">Tableau</div>
          </div>
          <div className="absolute top-1/2 -right-6 bg-white rounded-lg p-3 shadow-card animate-scale-in delay-600">
            <div className="text-sm font-semibold text-accent-foreground">SQL</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-6 h-6 text-muted-foreground" />
      </div>
    </section>
  );
};

export default HeroSection;