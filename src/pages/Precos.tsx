import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Precos() {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: promotions } = useQuery({
    queryKey: ["active-promotions-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("active", true)
        .gte("valid_until", new Date().toISOString().split("T")[0]);
      if (error) throw error;
      return data;
    },
  });

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
              Tabela de Valores
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Nossos <span className="text-gradient">Preços</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Valores transparentes para todos os nossos serviços de bronzeamento
            </p>
          </motion.div>
        </div>
      </section>

      {/* Price Table */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="card-elegant overflow-hidden">
              <div className="bg-primary/5 px-8 py-6 border-b border-border">
                <h2 className="font-display text-2xl font-semibold">Serviços e Valores</h2>
              </div>
              
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : services && services.length > 0 ? (
                <div className="divide-y divide-border">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-semibold mb-1">
                          {service.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Check className="w-4 h-4 text-primary" />
                            {service.duration} minutos
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-3xl font-bold text-primary">
                          R$ {Number(service.price).toFixed(2).replace(".", ",")}
                        </span>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/agendamento">Agendar</Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum serviço disponível no momento.
                </div>
              )}
            </div>
          </motion.div>

          {/* Promotions Notice */}
          {promotions && promotions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto mt-8"
            >
              <div className="card-elegant p-8 bg-gradient-to-br from-primary/5 to-accent/5 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  Promoções Ativas
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3">
                  Temos {promotions.length} promoção{promotions.length > 1 ? "ões" : ""} ativa{promotions.length > 1 ? "s" : ""}!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Confira nossas ofertas especiais e economize no seu bronzeado
                </p>
                <Button asChild variant="hero">
                  <Link to="/promocoes">Ver Promoções</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl font-bold mb-6">Formas de Pagamento</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito"].map((method) => (
                <div key={method} className="card-elegant p-4 text-center">
                  <Check className="w-6 h-6 text-primary mx-auto mb-2" />
                  <span className="text-sm font-medium">{method}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
