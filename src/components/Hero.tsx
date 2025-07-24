import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import heroBackground from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-secondary opacity-80" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-glow" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-primary-glow" />
            <span className="text-sm font-medium text-foreground">Welcome to the Future</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary-glow to-foreground bg-clip-text text-transparent leading-tight">
            Build Amazing
            <br />
            <span className="text-primary-glow">React Apps</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Create stunning, modern web applications with our powerful React platform. 
            Experience the perfect blend of performance, design, and functionality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="lg" className="text-lg px-8 py-4">
              View Demo
            </Button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="bg-card/10 backdrop-blur-sm border border-border/20 rounded-lg p-6 hover:bg-card/20 transition-all duration-300 hover:shadow-elegant">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary-glow" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Lightning Fast</h3>
            <p className="text-muted-foreground">Built with modern technologies for optimal performance and speed.</p>
          </div>
          
          <div className="bg-card/10 backdrop-blur-sm border border-border/20 rounded-lg p-6 hover:bg-card/20 transition-all duration-300 hover:shadow-elegant">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary-glow" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Secure & Reliable</h3>
            <p className="text-muted-foreground">Enterprise-grade security with reliable infrastructure you can trust.</p>
          </div>
          
          <div className="bg-card/10 backdrop-blur-sm border border-border/20 rounded-lg p-6 hover:bg-card/20 transition-all duration-300 hover:shadow-elegant">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary-glow" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Beautiful Design</h3>
            <p className="text-muted-foreground">Stunning user interfaces with smooth animations and modern aesthetics.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;