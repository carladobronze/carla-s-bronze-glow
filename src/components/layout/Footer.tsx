import { Link } from "react-router-dom";
import { Sparkles, Instagram, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-100 dark:bg-neutral-950">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <div className="flex flex-col">
                <span className="font-display text-xl font-semibold">
                  Espaço Carla
                </span>
                <span className="text-xs text-primary-foreground/60 -mt-1">do Bronze</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Especialistas em bronze artificial no Rio de Janeiro. 
              Realce sua beleza com um bronzeado perfeito e natural.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Navegação</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/servicos" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                Serviços
              </Link>
              <Link to="/precos" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                Preços
              </Link>
              <Link to="/promocoes" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                Promoções
              </Link>
              <Link to="/agendamento" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                Agendar
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Contato</h4>
            <div className="space-y-3">
              <a 
                href="https://wa.me/5521999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                (21) 99999-9999
              </a>
              <a 
                href="https://instagram.com/espacocarlabronze" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @espacocarlabronze
              </a>
              <div className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Rio de Janeiro, RJ</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Horário</h4>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <p>Segunda a Sexta: 9h às 20h</p>
              <p>Sábado: 9h às 18h</p>
              <p>Domingo: Fechado</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © 2024 Espaço Carla do Bronze. Todos os direitos reservados.
          </p>
          <p className="text-xs text-primary-foreground/30">
            Desenvolvido com 💗
          </p>
        </div>
      </div>
    </footer>
  );
}
