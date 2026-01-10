import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { PaymentMethodDialog } from "@/components/PaymentMethodDialog";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, List, Phone, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"] & {
  services: { name: string } | null;
};
type PaymentMethod = Database["public"]["Enums"]["payment_method"];

export default function AdminAgendamentos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [pendingCompletion, setPendingCompletion] = useState<{
    id: string;
    price: number;
    serviceName: string;
    clientName: string;
  } | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, services(name)")
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data as Appointment[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, price, serviceName, paymentMethod }: { 
      id: string; 
      status: string; 
      price: number; 
      serviceName: string;
      paymentMethod?: PaymentMethod;
    }) => {
      await supabase.from("appointments").update({ status: status as any }).eq("id", id);
      if (status === "completed" && paymentMethod) {
        await supabase.from("financial_entries").insert({ 
          appointment_id: id, 
          service_name: serviceName, 
          amount: price, 
          payment_method: paymentMethod 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["today-revenue"] });
      queryClient.invalidateQueries({ queryKey: ["financial-entries"] });
      toast({ title: "Status atualizado!" });
    },
  });

  const handleStatusChange = (apt: Appointment, newStatus: string) => {
    if (newStatus === "completed") {
      setPendingCompletion({
        id: apt.id,
        price: Number(apt.price),
        serviceName: apt.services?.name || "Serviço",
        clientName: apt.client_name,
      });
      setPaymentDialogOpen(true);
    } else {
      updateStatus.mutate({
        id: apt.id,
        status: newStatus,
        price: Number(apt.price),
        serviceName: apt.services?.name || "",
      });
    }
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    if (pendingCompletion) {
      updateStatus.mutate({
        id: pendingCompletion.id,
        status: "completed",
        price: pendingCompletion.price,
        serviceName: pendingCompletion.serviceName,
        paymentMethod: method,
      });
      setPaymentDialogOpen(false);
      setPendingCompletion(null);
    }
  };

  const statusColors: Record<string, string> = { 
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800", 
    completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800", 
    cancelled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" 
  };
  const statusLabels: Record<string, string> = { 
    pending: "Pendente", 
    completed: "Concluído", 
    cancelled: "Cancelado" 
  };

  const parseDateString = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments?.filter(apt => 
      isSameDay(parseDateString(apt.appointment_date), date)
    ) || [];
  };

  const datesWithAppointments = appointments?.reduce((acc, apt) => {
    const dateStr = apt.appointment_date;
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>) || {};

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <h1 className="font-display text-2xl lg:text-3xl font-bold">Agendamentos</h1>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 self-start">
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
              view === "calendar" ? "bg-card shadow-sm" : "hover:bg-card/50"
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Calendário</span>
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
              view === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"
            )}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Lista</span>
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1">
            <div className="card-elegant p-3 lg:p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={ptBR}
                className="pointer-events-auto w-full"
                modifiers={{
                  hasAppointments: (date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    return !!datesWithAppointments[dateStr]?.length;
                  },
                }}
                modifiersStyles={{
                  hasAppointments: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    textDecorationColor: "hsl(var(--primary))",
                    textUnderlineOffset: "4px",
                  },
                }}
                classNames={{
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary",
                  day_today: "bg-accent text-accent-foreground",
                }}
              />
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                  <span className="font-bold underline underline-offset-4">Sublinhado</span>
                  <span>= agendamentos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card-elegant p-4 lg:p-6">
              <h2 className="font-display text-lg lg:text-xl font-semibold mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span>{format(selectedDate, "EEEE, dd/MM", { locale: ptBR })}</span>
                </div>
                <span className="sm:ml-auto text-sm font-normal text-muted-foreground">
                  {selectedDateAppointments.length} agendamento{selectedDateAppointments.length !== 1 ? "s" : ""}
                </span>
              </h2>

              {selectedDateAppointments.length > 0 ? (
                <div className="space-y-3 lg:space-y-4">
                  {selectedDateAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          "p-3 lg:p-4 rounded-xl border-2 transition-colors",
                          statusColors[apt.status]
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-base lg:text-lg font-bold">{apt.appointment_time.slice(0, 5)}</span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-black/10 dark:bg-white/10">
                                {statusLabels[apt.status]}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 opacity-60 shrink-0" />
                                <span className="font-medium truncate">{apt.client_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 opacity-60 shrink-0" />
                                <a 
                                  href={`https://wa.me/55${apt.client_phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline truncate"
                                >
                                  {apt.client_phone}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 opacity-60 shrink-0" />
                                <span className="truncate">{apt.services?.name || "Serviço não especificado"}</span>
                              </div>
                            </div>
                            {apt.notes && (
                              <p className="mt-2 text-xs lg:text-sm italic opacity-70">"{apt.notes}"</p>
                            )}
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-current/10">
                            <span className="font-bold text-sm lg:text-base">
                              R$ {Number(apt.price).toFixed(2).replace(".", ",")}
                            </span>
                            <Select
                              value={apt.status}
                              onValueChange={(v) => handleStatusChange(apt, v)}
                            >
                              <SelectTrigger className="w-28 lg:w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="completed">Concluído</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 lg:py-12 text-muted-foreground">
                  <CalendarIcon className="w-10 lg:w-12 h-10 lg:h-12 mx-auto mb-3 lg:mb-4 opacity-30" />
                  <p className="text-sm lg:text-base">Nenhum agendamento para esta data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-elegant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 lg:p-4 font-medium">Cliente</th>
                  <th className="text-left p-3 lg:p-4 font-medium hidden sm:table-cell">Serviço</th>
                  <th className="text-left p-3 lg:p-4 font-medium">Data</th>
                  <th className="text-left p-3 lg:p-4 font-medium hidden md:table-cell">Horário</th>
                  <th className="text-left p-3 lg:p-4 font-medium hidden lg:table-cell">Valor</th>
                  <th className="text-left p-3 lg:p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments?.map((apt) => (
                  <tr key={apt.id} className="hover:bg-muted/30">
                    <td className="p-3 lg:p-4">
                      <div className="font-medium truncate max-w-[120px] lg:max-w-none">{apt.client_name}</div>
                      <a 
                        href={`https://wa.me/55${apt.client_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        {apt.client_phone}
                      </a>
                    </td>
                    <td className="p-3 lg:p-4 hidden sm:table-cell">{apt.services?.name || "—"}</td>
                    <td className="p-3 lg:p-4 whitespace-nowrap">{format(parseDateString(apt.appointment_date), "dd/MM/yy")}</td>
                    <td className="p-3 lg:p-4 hidden md:table-cell">{apt.appointment_time.slice(0, 5)}</td>
                    <td className="p-3 lg:p-4 hidden lg:table-cell">R$ {Number(apt.price).toFixed(2).replace(".", ",")}</td>
                    <td className="p-3 lg:p-4">
                      <Select
                        value={apt.status}
                        onValueChange={(v) => handleStatusChange(apt, v)}
                      >
                        <SelectTrigger className={cn("w-24 lg:w-32 h-8 text-xs", statusColors[apt.status])}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!appointments?.length && (
              <p className="p-6 lg:p-8 text-center text-muted-foreground text-sm">Nenhum agendamento encontrado.</p>
            )}
          </div>
        </div>
      )}

      <PaymentMethodDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSelect={handlePaymentSelect}
        appointmentInfo={{
          clientName: pendingCompletion?.clientName || "",
          serviceName: pendingCompletion?.serviceName || "",
          price: pendingCompletion?.price || 0,
        }}
      />
    </div>
  );
}
