import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Serviços" },
  { href: "/precos", label: "Preços" },
  { href: "/promocoes", label: "Promoções" },
  { href: "/agendamento", label: "Agendar" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass-effect">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-8 h-8 text-primary transition-transform group-hover:rotate-12" />
            <div className="flex flex-col">
              <span className="font-display text-xl font-semibold text-foreground">
                Espaço Carla
              </span>
              <span className="text-xs text-muted-foreground -mt-1">do Bronze</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button & Admin Link */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Área Admin
            </Link>
            <Button asChild variant="hero" size="lg">
              <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer">
                Agendar Agora
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border mt-2 flex flex-col gap-2">
                <Link 
                  to="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-sm text-muted-foreground hover:text-primary"
                >
                  Área Administrativa
                </Link>
                <Button asChild variant="hero" size="lg" className="w-full">
                  <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer">
                    Agendar Agora
                  </a>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
