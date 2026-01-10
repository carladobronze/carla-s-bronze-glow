import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, List, Phone, User, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"] & {
  services: { name: string } | null;
};

export default function AdminAgendamentos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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
    mutationFn: async ({ id, status, price, serviceName }: { id: string; status: string; price: number; serviceName: string }) => {
      await supabase.from("appointments").update({ status: status as any }).eq("id", id);
      if (status === "completed") {
        await supabase.from("financial_entries").insert({ 
          appointment_id: id, 
          service_name: serviceName, 
          amount: price, 
          payment_method: "cash" 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["today-revenue"] });
      toast({ title: "Status atualizado!" });
    },
  });

  const statusColors: Record<string, string> = { 
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    completed: "bg-green-100 text-green-800 border-green-200", 
    cancelled: "bg-red-100 text-red-800 border-red-200" 
  };
  const statusLabels: Record<string, string> = { 
    pending: "Pendente", 
    completed: "Concluído", 
    cancelled: "Cancelado" 
  };

  // Parse date string without timezone issues (YYYY-MM-DD)
  const parseDateString = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments?.filter(apt => 
      isSameDay(parseDateString(apt.appointment_date), date)
    ) || []
  };

  // Get dates with appointments for calendar highlighting
  const datesWithAppointments = appointments?.reduce((acc, apt) => {
    const dateStr = apt.appointment_date;
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>) || {};

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Agendamentos</h1>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
              view === "calendar" ? "bg-card shadow-sm" : "hover:bg-card/50"
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendário
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
              view === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"
            )}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <div className="card-elegant p-4">
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
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-bold underline underline-offset-4">Data sublinhada</span>
                  <span>= tem agendamentos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Day Details */}
          <div className="lg:col-span-2">
            <div className="card-elegant p-6">
              <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {selectedDateAppointments.length} agendamento{selectedDateAppointments.length !== 1 ? "s" : ""}
                </span>
              </h2>

              {selectedDateAppointments.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-colors",
                          statusColors[apt.status]
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-bold">{apt.appointment_time.slice(0, 5)}</span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-black/10">
                                {statusLabels[apt.status]}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 opacity-60" />
                                <span className="font-medium">{apt.client_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 opacity-60" />
                                <a 
                                  href={`https://wa.me/55${apt.client_phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm hover:underline"
                                >
                                  {apt.client_phone}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 opacity-60" />
                                <span className="text-sm">{apt.services?.name || "Serviço não especificado"}</span>
                              </div>
                            </div>
                            {apt.notes && (
                              <p className="mt-2 text-sm italic opacity-70">"{apt.notes}"</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="font-bold">
                              R$ {Number(apt.price).toFixed(2).replace(".", ",")}
                            </span>
                            <Select
                              value={apt.status}
                              onValueChange={(v) => updateStatus.mutate({
                                id: apt.id,
                                status: v,
                                price: Number(apt.price),
                                serviceName: apt.services?.name || ""
                              })}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
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
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum agendamento para esta data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="card-elegant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Cliente</th>
                  <th className="text-left p-4 font-medium">Serviço</th>
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Horário</th>
                  <th className="text-left p-4 font-medium">Valor</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments?.map((apt) => (
                  <tr key={apt.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="font-medium">{apt.client_name}</div>
                      <a 
                        href={`https://wa.me/55${apt.client_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {apt.client_phone}
                      </a>
                    </td>
                    <td className="p-4">{apt.services?.name || "—"}</td>
                    <td className="p-4">{format(parseDateString(apt.appointment_date), "dd/MM/yyyy")}</td>
                    <td className="p-4">{apt.appointment_time.slice(0, 5)}</td>
                    <td className="p-4">R$ {Number(apt.price).toFixed(2).replace(".", ",")}</td>
                    <td className="p-4">
                      <Select
                        value={apt.status}
                        onValueChange={(v) => updateStatus.mutate({
                          id: apt.id,
                          status: v,
                          price: Number(apt.price),
                          serviceName: apt.services?.name || ""
                        })}
                      >
                        <SelectTrigger className={cn("w-32", statusColors[apt.status])}>
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
              <p className="p-8 text-center text-muted-foreground">Nenhum agendamento encontrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
