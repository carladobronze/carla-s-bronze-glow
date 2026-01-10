import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarIcon, Clock, MessageCircle, Sparkles, Check, User, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Layout } from "@/components/layout/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format, addDays, isSunday, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const appointmentSchema = z.object({
  clientName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  clientPhone: z.string().min(10, "Telefone inválido").max(20),
  serviceId: z.string().min(1, "Selecione um serviço"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  notes: z.string().max(500).optional(),
});

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00"
];

const saturdaySlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export default function Agendamento() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
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

  // Fetch existing appointments for the selected date to show occupied slots
  const { data: existingAppointments } = useQuery({
    queryKey: ["appointments-for-date", formData.date],
    queryFn: async () => {
      if (!formData.date) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("appointment_date", formData.date)
        .neq("status", "cancelled");
      if (error) throw error;
      return data || [];
    },
    enabled: !!formData.date,
  });

  const occupiedSlots = existingAppointments?.map(a => a.appointment_time.slice(0, 5)) || [];

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
        title: "Agendamento confirmado!",
        description: "Seu horário foi reservado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData({ ...formData, date: format(date, "yyyy-MM-dd"), time: "" });
      setStep(2);
    }
  };

  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, time });
    setStep(3);
  };

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

  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    const isSat = selectedDate.getDay() === 6;
    const slots = isSat ? saturdaySlots : timeSlots;
    return slots.filter(slot => !occupiedSlots.includes(slot));
  };

  const selectedService = services?.find(s => s.id === formData.serviceId);

  // Disable past dates and Sundays
  const disabledDays = (date: Date) => {
    const today = startOfDay(new Date());
    return date < addDays(today, 1) || isSunday(date);
  };

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
                Agendamento Confirmado!
              </h1>
              <p className="text-muted-foreground mb-8">
                Seu horário foi reservado. Aguardamos você!
              </p>
              <div className="card-elegant p-6 mb-8 text-left">
                <h3 className="font-semibold mb-4">Resumo do agendamento:</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Nome:</span> {formData.clientName}</p>
                  <p><span className="text-muted-foreground">Telefone:</span> {formData.clientPhone}</p>
                  <p><span className="text-muted-foreground">Serviço:</span> {selectedService?.name}</p>
                  <p><span className="text-muted-foreground">Data:</span> {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                  <p><span className="text-muted-foreground">Horário:</span> {formData.time}</p>
                </div>
              </div>
              <Button asChild variant="whatsapp" size="lg">
                <a 
                  href={`https://wa.me/5521999999999?text=Olá! Acabei de agendar ${selectedService?.name} para ${selectedDate && format(selectedDate, "dd/MM/yyyy")} às ${formData.time}. Meu nome é ${formData.clientName}.`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Enviar Confirmação no WhatsApp
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
      <section className="py-12 md:py-20 bg-gradient-to-br from-background via-rose-gold-light/10 to-nude-light">
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
              Escolha a data, horário e preencha seus dados para reservar
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[
              { num: 1, label: "Data" },
              { num: 2, label: "Horário" },
              { num: 3, label: "Dados" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 md:gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                  step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={cn(
                  "hidden md:block font-medium transition-colors",
                  step >= s.num ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
                {i < 2 && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Steps */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Date */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md mx-auto"
              >
                <h2 className="font-display text-2xl font-bold text-center mb-8">
                  Escolha a <span className="text-primary">Data</span>
                </h2>
                <div className="card-elegant p-6 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={disabledDays}
                    locale={ptBR}
                    className="pointer-events-auto"
                    classNames={{
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground font-bold",
                    }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  * Fechado aos domingos
                </p>
              </motion.div>
            )}

            {/* Step 2: Select Time */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-4 mb-8">
                  <Button variant="ghost" size="icon" onClick={() => setStep(1)}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="font-display text-2xl font-bold">
                    Escolha o <span className="text-primary">Horário</span>
                  </h2>
                </div>

                <div className="card-elegant p-6 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {getAvailableSlots().map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={cn(
                          "py-3 px-4 rounded-xl text-center font-medium transition-all border-2",
                          formData.time === time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 hover:bg-primary/10 border-transparent hover:border-primary/50"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  {getAvailableSlots().length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Não há horários disponíveis nesta data. Por favor, escolha outra data.
                    </p>
                  )}

                  {occupiedSlots.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Horários já reservados não são exibidos
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Personal Info */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-4 mb-8">
                  <Button variant="ghost" size="icon" onClick={() => setStep(2)}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="font-display text-2xl font-bold">
                    Seus <span className="text-primary">Dados</span>
                  </h2>
                </div>

                {/* Selected Date/Time Summary */}
                <div className="card-elegant p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      {selectedDate && format(selectedDate, "dd/MM/yyyy")}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      {formData.time}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                    Alterar
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="card-elegant p-8 space-y-6">
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
                    {createAppointment.isPending ? "Agendando..." : "Confirmar Agendamento"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </Layout>
  );
}
