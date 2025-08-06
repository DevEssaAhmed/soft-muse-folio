import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Heart, 
  ArrowUp,
  Code,
  Database,
  BarChart3,
  Palette,
  Globe
} from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

const Footer = () => {
  const { profile } = useProfile();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Articles', href: '/articles' },
    { name: 'About', href: '/about' },
  ];

  const services = [
    { name: 'Data Analysis', icon: BarChart3 },
    { name: 'Python Development', icon: Code },
    { name: 'Database Design', icon: Database },
    { name: 'Data Visualization', icon: Palette },
  ];

  const socialLinks = [
    ...(profile?.github_url ? [{ 
      name: 'GitHub', 
      href: profile.github_url, 
      icon: Github,
      color: 'hover:text-gray-900 dark:hover:text-gray-100'
    }] : []),
    ...(profile?.linkedin_url ? [{ 
      name: 'LinkedIn', 
      href: profile.linkedin_url, 
      icon: Linkedin,
      color: 'hover:text-blue-600'
    }] : []),
    ...(profile?.website_url ? [{ 
      name: 'Website', 
      href: profile.website_url, 
      icon: Globe,
      color: 'hover:text-green-500'
    }] : []),
    ...(profile?.email ? [{ 
      name: 'Email', 
      href: `mailto:${profile.email}`, 
      icon: Mail,
      color: 'hover:text-red-500'
    }] : []),
  ];

  return (
    <footer className="bg-background border-t border-border/50 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {profile?.name || "Portfolio"}
              </h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {profile?.bio || "Professional portfolio showcasing projects and expertise in data analysis and development."}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-all duration-300 ${link.color}`}
                    aria-label={link.name}
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-6">Services</h4>
            <ul className="space-y-3">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <li key={service.name} className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{service.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter/Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-6">Stay Connected</h4>
            <p className="text-muted-foreground mb-4">
              Get updates on my latest projects and insights in data science.
            </p>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:shadow-soft transition-all duration-300"
                asChild
              >
                <a href={`mailto:${profile?.email || 'contact@example.com'}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Get in Touch
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:shadow-soft transition-all duration-300"
                asChild
              >
                <a href="/articles" target="_blank" rel="noopener noreferrer">
                  <Code className="w-4 h-4 mr-2" />
                  Read My Blog
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2024 {profile?.name || "Portfolio"}. Built with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>using React & TypeScript</span>
            </div>

            {/* Back to Top */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={scrollToTop}
              className="hover:shadow-soft transition-all duration-300"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Back to Top
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </footer>
  );
};

export default Footer;