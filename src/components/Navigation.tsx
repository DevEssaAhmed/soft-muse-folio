import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const navItems = ["Home", "Projects", "About", "Skills", "Contact"];
  
  const handleAdminAccess = () => {
    // Simple admin access - in production, you'd want proper authentication
    const adminKey = prompt("Enter admin key:");
    if (adminKey === "admin123") {
      window.location.href = "/admin";
    }
  };

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            Alex Chen
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <a
              href="/projects"
              className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors duration-300 relative group"
            >
              <span className="w-4 h-4 bg-primary/20 rounded-sm flex items-center justify-center">
                <span className="w-2 h-2 bg-primary rounded-sm"></span>
              </span>
              PROJECTS
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="/articles"
              className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors duration-300 relative group"
            >
              <span className="w-4 h-4 border border-primary/40 rounded-sm flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full"></span>
              </span>
              ARTICLES
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="/about"
              className="text-foreground/80 hover:text-primary transition-colors duration-300 relative group"
            >
              ABOUT
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          {/* Theme toggle & CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-primary hover:shadow-soft transition-all duration-300"
            >
              Hire Me
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleAdminAccess}
              className="hover:shadow-soft transition-all duration-300"
            >
              Admin
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-up">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block text-foreground/80 hover:text-primary transition-colors duration-300 py-2"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </a>
            ))}
            <Button 
              size="sm" 
              className="w-full bg-gradient-primary"
            >
              Hire Me
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;