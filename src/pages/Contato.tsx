import { motion } from "framer-motion";
import { Instagram, MapPin, MessageCircle, Phone, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

export default function Contato() {
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
              Fale Conosco
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Entre em <span className="text-gradient">Contato</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Estamos prontas para atender você! Entre em contato pelos nossos canais
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* WhatsApp */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="card-elegant p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#25D366]/10 text-[#25D366] mb-6">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">WhatsApp</h3>
              <p className="text-muted-foreground mb-6">
                Fale diretamente conosco pelo WhatsApp para agendar ou tirar dúvidas
              </p>
              <Button asChild variant="whatsapp" className="w-full">
                <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer">
                  <Phone className="w-4 h-4 mr-2" />
                  (21) 99999-9999
                </a>
              </Button>
            </motion.div>

            {/* Instagram */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="card-elegant p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 text-pink-500 mb-6">
                <Instagram className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Instagram</h3>
              <p className="text-muted-foreground mb-6">
                Siga nosso perfil para ver resultados, novidades e promoções
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="https://instagram.com/espacocarlabronze" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-4 h-4 mr-2" />
                  @espacocarlabronze
                </a>
              </Button>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="card-elegant p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Localização</h3>
              <p className="text-muted-foreground mb-6">
                Estamos localizadas no coração do Rio de Janeiro
              </p>
              <Button asChild variant="nude" className="w-full">
                <a 
                  href="https://maps.google.com/?q=Rio+de+Janeiro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Ver no Mapa
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hours & Map */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-primary" />
                <h2 className="font-display text-2xl font-bold">Horário de Funcionamento</h2>
              </div>
              <div className="card-elegant p-8 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="font-medium">Segunda-feira</span>
                  <span className="text-muted-foreground">9h às 20h</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="font-medium">Terça-feira</span>
                  <span className="text-muted-foreground">9h às 20h</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="font-medium">Quarta-feira</span>
                  <span className="text-muted-foreground">9h às 20h</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="font-medium">Quinta-feira</span>
                  <span className="text-muted-foreground">9h às 20h</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="font-medium">Sexta-feira</span>
                  <span className="text-muted-foreground">9h às 20h</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="font-medium">Sábado</span>
                  <span className="text-muted-foreground">9h às 18h</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium">Domingo</span>
                  <span className="text-primary font-medium">Fechado</span>
                </div>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-primary" />
                <h2 className="font-display text-2xl font-bold">Nossa Localização</h2>
              </div>
              <div className="card-elegant overflow-hidden h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235205.00792989845!2d-43.58841787499999!3d-22.9111717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9bde559108a05b%3A0x50dc426c672fd24e!2sRio%20de%20Janeiro%2C%20RJ!5e0!3m2!1spt-BR!2sbr!4v1704500000000!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização Espaço Carla do Bronze"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-elegant p-12 text-center max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5"
          >
            <h2 className="font-display text-3xl font-bold mb-4">
              Pronta para Agendar?
            </h2>
            <p className="text-muted-foreground mb-8">
              Marque seu horário agora mesmo e venha ficar ainda mais linda!
            </p>
            <Button asChild variant="hero" size="xl">
              <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                Agendar pelo WhatsApp
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
