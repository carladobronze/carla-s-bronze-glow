import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Star, Clock, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const { data: promotions } = useQuery({
    queryKey: ["active-promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("active", true)
        .gte("valid_until", new Date().toISOString().split("T")[0])
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ["featured-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-rose-gold-light/20 to-nude-light" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Especialistas em Bronze Artificial
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">
                Espaço Carla
                <span className="block text-gradient">do Bronze</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Realce sua beleza natural com um bronzeado perfeito e uniforme. 
                Técnicas profissionais e produtos de alta qualidade para um resultado impecável.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild variant="hero" size="xl">
                  <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer">
                    <Calendar className="w-5 h-5" />
                    Agendar Horário
                  </a>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link to="/servicos">
                    Ver Serviços
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: "Qualidade Premium", desc: "Produtos importados de primeira linha" },
              { icon: Clock, title: "Resultado Rápido", desc: "Bronze instantâneo em até 45 minutos" },
              { icon: Award, title: "Profissionais Experientes", desc: "Equipe especializada em bronzeamento" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-elegant p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      {services && services.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl font-bold mb-4">Nossos Serviços</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Conheça nossos tratamentos e escolha o ideal para você
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-elegant p-8 hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-2 text-primary mb-4">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{service.duration} min</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold mb-3">{service.name}</h3>
                  <p className="text-muted-foreground mb-6 line-clamp-3">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      R$ {Number(service.price).toFixed(2).replace(".", ",")}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/agendamento">Agendar</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="nude" size="lg">
                <Link to="/servicos">Ver Todos os Serviços</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Promotions Section */}
      {promotions && promotions.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Promoções Ativas
              </div>
              <h2 className="font-display text-4xl font-bold mb-4">Ofertas Especiais</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Aproveite nossas promoções por tempo limitado
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {promotions.map((promo, index) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-elegant p-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-xl">
                    PROMO
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3 pr-16">{promo.name}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{promo.description}</p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {Number(promo.original_price).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {Number(promo.promotional_price).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Válido até {new Date(promo.valid_until).toLocaleDateString("pt-BR")}
                  </p>
                  <Button asChild variant="hero" className="w-full">
                    <Link to="/agendamento">Aproveitar</Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="nude" size="lg">
                <Link to="/promocoes">Ver Todas as Promoções</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-elegant p-12 md:p-16 text-center bg-gradient-to-br from-primary/5 to-accent/5"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Pronta para ficar <span className="text-gradient">Deslumbrante</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Agende seu horário agora e descubra o poder de um bronzeado perfeito. 
              Nossa equipe está esperando por você!
            </p>
            <Button asChild variant="whatsapp" size="xl">
              <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
