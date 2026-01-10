import { motion } from "framer-motion";
import { Calendar, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Promocoes() {
  const { data: promotions, isLoading } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("active", true)
        .gte("valid_until", new Date().toISOString().split("T")[0])
        .order("valid_until", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const calculateDiscount = (original: number, promo: number) => {
    return Math.round(((original - promo) / original) * 100);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-background via-rose-gold-light/10 to-nude-light">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Ofertas Especiais
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Nossas <span className="text-gradient">Promoções</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Aproveite nossas ofertas exclusivas por tempo limitado
            </p>
          </motion.div>
        </div>
      </section>

      {/* Promotions List */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-elegant p-8 animate-pulse">
                  <div className="h-6 bg-muted rounded w-16 mb-4" />
                  <div className="h-8 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-16 bg-muted rounded mb-6" />
                  <div className="h-12 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : promotions && promotions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promotions.map((promo, index) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-elegant p-8 relative overflow-hidden flex flex-col"
                >
                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                    -{calculateDiscount(Number(promo.original_price), Number(promo.promotional_price))}%
                  </div>

                  <div className="flex items-center gap-2 text-primary mb-4">
                    <Tag className="w-5 h-5" />
                    <span className="text-sm font-medium">Promoção</span>
                  </div>

                  <h3 className="font-display text-2xl font-semibold mb-3 pr-16">
                    {promo.name}
                  </h3>
                  
                  <p className="text-muted-foreground flex-1 mb-6">
                    {promo.description}
                  </p>

                  <div className="space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-muted-foreground line-through">
                        R$ {Number(promo.original_price).toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-3xl font-bold text-primary">
                        R$ {Number(promo.promotional_price).toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Válido até {new Date(promo.valid_until).toLocaleDateString("pt-BR")}</span>
                    </div>

                    <Button asChild variant="hero" className="w-full">
                      <Link to="/agendamento">Aproveitar Agora</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <Tag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-3">
                Sem promoções no momento
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Não temos promoções ativas no momento, mas fique de olho! Novas ofertas podem aparecer a qualquer momento.
              </p>
              <Button asChild variant="nude">
                <Link to="/servicos">Ver Nossos Serviços</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl font-bold mb-4">
              Quer saber das novidades?
            </h2>
            <p className="text-muted-foreground mb-8">
              Siga nosso Instagram para ficar por dentro de todas as promoções e novidades!
            </p>
            <Button asChild variant="outline" size="lg">
              <a href="https://instagram.com/espacocarlabronze" target="_blank" rel="noopener noreferrer">
                Seguir no Instagram
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
