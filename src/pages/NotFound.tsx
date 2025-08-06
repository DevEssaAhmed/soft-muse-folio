import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <div className="pt-20">
        <div className="min-h-screen flex items-center justify-center px-6">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-primary/20 shadow-glow">
            <CardContent className="p-8 text-center">
              {/* 404 Animation */}
              <div className="mb-6">
                <div className="text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 animate-pulse">
                  404
                </div>
                <div className="w-16 h-1 bg-gradient-primary rounded-full mx-auto mb-4 animate-pulse"></div>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Page Not Found
              </h1>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The page you're looking for doesn't exist or has been moved. 
                Don't worry, let's get you back on track!
              </p>

              {/* Current Path Display */}
              <div className="bg-muted/30 rounded-lg p-3 mb-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Requested:</span>
                  <code className="ml-2 px-2 py-1 bg-muted/50 rounded text-xs">
                    {location.pathname}
                  </code>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/")}
                  className="w-full bg-gradient-primary hover:shadow-soft transition-all duration-300"
                  size="lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="hover:shadow-soft transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/articles")}
                    className="hover:shadow-soft transition-all duration-300"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Articles
                  </Button>
                </div>
              </div>

              {/* Helpful Links */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-3">
                  Looking for something specific?
                </p>
                <div className="flex justify-center gap-4 text-xs">
                  <button 
                    onClick={() => navigate("/projects")}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Projects
                  </button>
                  <button 
                    onClick={() => navigate("/articles")}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Articles
                  </button>
                  <button 
                    onClick={() => navigate("/about")}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    About
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
