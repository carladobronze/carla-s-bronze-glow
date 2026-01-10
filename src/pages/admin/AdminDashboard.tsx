import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  const { data: todayAppointments } = useQuery({
    queryKey: ["today-appointments"],
    queryFn: async () => {
      const { count } = await supabase.from("appointments").select("*", { count: "exact", head: true }).eq("appointment_date", today);
      return count || 0;
    },
  });

  const { data: todayRevenue } = useQuery({
    queryKey: ["today-revenue"],
    queryFn: async () => {
      const { data } = await supabase.from("financial_entries").select("amount").eq("entry_date", today);
      return data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    },
  });

  const { data: monthRevenue } = useQuery({
    queryKey: ["month-revenue"],
    queryFn: async () => {
      const { data } = await supabase.from("financial_entries").select("amount").gte("entry_date", startOfMonth);
      return data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    },
  });

  const stats = [
    { label: "Agendamentos Hoje", value: todayAppointments ?? 0, icon: Calendar, color: "text-blue-500" },
    { label: "Faturamento Hoje", value: `R$ ${(todayRevenue ?? 0).toFixed(2).replace(".", ",")}`, icon: DollarSign, color: "text-green-500" },
    { label: "Faturamento do Mês", value: `R$ ${(monthRevenue ?? 0).toFixed(2).replace(".", ",")}`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl lg:text-3xl font-bold mb-6 lg:mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card-elegant p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className={`p-2 lg:p-3 rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-muted-foreground truncate">{stat.label}</p>
                <p className="text-lg lg:text-2xl font-bold truncate">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
