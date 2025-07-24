import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ReactApp
            </h2>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Features
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                About
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost">Sign In</Button>
            <Button variant="default">Get Started</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-sm border-t border-border/50">
              <a
                href="#"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
              >
                Pricing
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  Sign In
                </Button>
                <Button variant="default" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;