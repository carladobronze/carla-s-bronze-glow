import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];

export default function AdminAgendamentos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments").select("*, services(name)").order("appointment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, price, serviceName }: { id: string; status: string; price: number; serviceName: string }) => {
      await supabase.from("appointments").update({ status: status as any }).eq("id", id);
      if (status === "completed") {
        await supabase.from("financial_entries").insert({ appointment_id: id, service_name: serviceName, amount: price, payment_method: "cash" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["today-revenue"] });
      toast({ title: "Status atualizado!" });
    },
  });

  const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };
  const statusLabels: Record<string, string> = { pending: "Pendente", completed: "Concluído", cancelled: "Cancelado" };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8">Agendamentos</h1>
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
                  <td className="p-4">{apt.client_name}<br /><span className="text-sm text-muted-foreground">{apt.client_phone}</span></td>
                  <td className="p-4">{(apt.services as any)?.name || "—"}</td>
                  <td className="p-4">{new Date(apt.appointment_date).toLocaleDateString("pt-BR")}</td>
                  <td className="p-4">{apt.appointment_time}</td>
                  <td className="p-4">R$ {Number(apt.price).toFixed(2).replace(".", ",")}</td>
                  <td className="p-4">
                    <Select value={apt.status} onValueChange={(v) => updateStatus.mutate({ id: apt.id, status: v, price: Number(apt.price), serviceName: (apt.services as any)?.name || "" })}>
                      <SelectTrigger className={`w-32 ${statusColors[apt.status]}`}><SelectValue /></SelectTrigger>
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
          {!appointments?.length && <p className="p-8 text-center text-muted-foreground">Nenhum agendamento encontrado.</p>}
        </div>
      </div>
    </div>
  );
}
