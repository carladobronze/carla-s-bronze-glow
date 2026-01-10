import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MessageCircle, Sparkles, Check, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const appointmentSchema = z.object({
  clientName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  clientPhone: z.string().min(10, "Telefone inválido").max(20),
  serviceId: z.string().min(1, "Selecione um serviço"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  notes: z.string().max(500).optional(),
});

export default function Agendamento() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    serviceId: "",
    date: "",
    time: "",
    notes: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: services } = useQuery({
    queryKey: ["services-booking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (data: typeof formData) => {
      const service = services?.find(s => s.id === data.serviceId);
      const { error } = await supabase.from("appointments").insert({
        client_name: data.clientName,
        client_phone: data.clientPhone,
        service_id: data.serviceId,
        appointment_date: data.date,
        appointment_time: data.time,
        notes: data.notes || null,
        price: service?.price || 0,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Agendamento enviado!",
        description: "Entraremos em contato para confirmar seu horário.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = appointmentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    createAppointment.mutate(formData);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 19; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 19) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const selectedService = services?.find(s => s.id === formData.serviceId);

  if (isSuccess) {
    return (
      <Layout>
        <section className="min-h-[70vh] flex items-center py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">
                Agendamento Enviado!
              </h1>
              <p className="text-muted-foreground mb-8">
                Recebemos seu pedido de agendamento. Nossa equipe entrará em contato pelo WhatsApp para confirmar seu horário.
              </p>
              <div className="card-elegant p-6 mb-8 text-left">
                <h3 className="font-semibold mb-4">Resumo do agendamento:</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Nome:</span> {formData.clientName}</p>
                  <p><span className="text-muted-foreground">Serviço:</span> {selectedService?.name}</p>
                  <p><span className="text-muted-foreground">Data:</span> {new Date(formData.date).toLocaleDateString("pt-BR")}</p>
                  <p><span className="text-muted-foreground">Horário:</span> {formData.time}</p>
                </div>
              </div>
              <Button asChild variant="whatsapp" size="lg">
                <a 
                  href={`https://wa.me/5521999999999?text=Olá! Acabei de fazer um agendamento para ${selectedService?.name} no dia ${new Date(formData.date).toLocaleDateString("pt-BR")} às ${formData.time}.`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Confirmar pelo WhatsApp
                </a>
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

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
              Marque seu Horário
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Fazer <span className="text-gradient">Agendamento</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Preencha o formulário abaixo e entraremos em contato para confirmar seu horário
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="card-elegant p-8 md:p-12 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome completo
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="Seu nome"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className={errors.clientName ? "border-destructive" : ""}
                  />
                  {errors.clientName && (
                    <p className="text-sm text-destructive">{errors.clientName}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="clientPhone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </Label>
                  <Input
                    id="clientPhone"
                    placeholder="(21) 99999-9999"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className={errors.clientPhone ? "border-destructive" : ""}
                  />
                  {errors.clientPhone && (
                    <p className="text-sm text-destructive">{errors.clientPhone}</p>
                  )}
                </div>
              </div>

              {/* Service */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Serviço desejado
                </Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                >
                  <SelectTrigger className={errors.serviceId ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - R$ {Number(service.price).toFixed(2).replace(".", ",")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceId && (
                  <p className="text-sm text-destructive">{errors.serviceId}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    min={getMinDate()}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={errors.date ? "border-destructive" : ""}
                  />
                  {errors.date && (
                    <p className="text-sm text-destructive">{errors.date}</p>
                  )}
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário
                  </Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => setFormData({ ...formData, time: value })}
                  >
                    <SelectTrigger className={errors.time ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeSlots().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.time && (
                    <p className="text-sm text-destructive">{errors.time}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma informação adicional..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Selected Service Summary */}
              {selectedService && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedService.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedService.duration} minutos</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      R$ {Number(selectedService.price).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                variant="hero" 
                size="xl" 
                className="w-full"
                disabled={createAppointment.isPending}
              >
                {createAppointment.isPending ? "Enviando..." : "Solicitar Agendamento"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Após o envio, entraremos em contato pelo WhatsApp para confirmar seu horário.
              </p>
            </form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
