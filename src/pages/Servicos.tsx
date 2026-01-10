import { motion } from "framer-motion";
import { Clock, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Servicos() {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
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
              Nossos Tratamentos
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Serviços <span className="text-gradient">Exclusivos</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Conheça todos os nossos serviços de bronzeamento e escolha o ideal para realçar sua beleza
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-elegant p-8 animate-pulse">
                  <div className="h-4 bg-muted rounded w-20 mb-4" />
                  <div className="h-8 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-20 bg-muted rounded mb-6" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-elegant p-8 flex flex-col h-full"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{service.duration} minutos</span>
                    </div>
                  </div>

                  <h3 className="font-display text-2xl font-semibold mb-3">
                    {service.name}
                  </h3>
                  
                  <p className="text-muted-foreground flex-1 mb-6">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div>
                      <span className="text-sm text-muted-foreground">A partir de</span>
                      <p className="text-3xl font-bold text-primary">
                        R$ {Number(service.price).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <Button asChild variant="hero">
                      <Link to="/agendamento">Agendar</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum serviço disponível no momento.</p>
            </div>
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
              Não sabe qual escolher?
            </h2>
            <p className="text-muted-foreground mb-8">
              Entre em contato conosco pelo WhatsApp e nossa equipe vai te ajudar a escolher o melhor tratamento para você!
            </p>
            <Button asChild variant="whatsapp" size="xl">
              <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer">
                Falar com Especialista
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
