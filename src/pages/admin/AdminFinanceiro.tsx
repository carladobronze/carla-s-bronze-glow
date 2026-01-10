import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronDown, ChevronUp, User, Calendar, Clock, CreditCard, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type FinancialEntry = {
  id: string;
  service_name: string;
  amount: number;
  payment_method: string;
  entry_date: string;
  appointment_id: string | null;
  appointments: {
    client_name: string;
    client_phone: string;
    appointment_time: string;
    appointment_date: string;
  } | null;
};

export default function AdminFinanceiro() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: entries } = useQuery({
    queryKey: ["financial-entries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("financial_entries")
        .select("*, appointments(client_name, client_phone, appointment_time, appointment_date)")
        .order("entry_date", { ascending: false });
      return (data || []) as FinancialEntry[];
    },
  });

  const paymentLabels: Record<string, string> = { 
    cash: "Dinheiro", 
    pix: "PIX", 
    credit_card: "Cartão de Crédito", 
    debit_card: "Cartão de Débito" 
  };
  
  const paymentColors: Record<string, string> = {
    cash: "#22c55e",
    pix: "#14b8a6",
    credit_card: "#3b82f6",
    debit_card: "#a855f7",
  };

  const total = entries?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  // Calculate payment method distribution
  const paymentMethodStats = entries?.reduce((acc, e) => {
    const method = e.payment_method;
    if (!acc[method]) {
      acc[method] = { name: paymentLabels[method], value: 0, count: 0 };
    }
    acc[method].value += Number(e.amount);
    acc[method].count += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number; count: number }>) || {};

  const chartData = Object.entries(paymentMethodStats).map(([key, data]) => ({
    ...data,
    key,
    color: paymentColors[key],
  }));

  const parseDateString = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <h1 className="font-display text-2xl lg:text-3xl font-bold">Financeiro</h1>
        <div className="card-elegant px-4 lg:px-6 py-2 lg:py-3 self-start">
          <span className="text-muted-foreground text-sm">Total:</span>
          <span className="text-xl lg:text-2xl font-bold text-primary ml-2">
            R$ {total.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* Payment Method Chart */}
      {chartData.length > 0 && (
        <div className="card-elegant p-4 lg:p-6 mb-6">
          <h2 className="font-display text-lg lg:text-xl font-semibold mb-4">Métodos de Pagamento</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {chartData.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">R$ {item.value.toFixed(2).replace(".", ",")}</div>
                    <div className="text-xs text-muted-foreground">{item.count} transações</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Entries Cards */}
      <div className="space-y-3">
        <h2 className="font-display text-lg lg:text-xl font-semibold mb-4">Histórico</h2>
        {entries?.map((e) => (
          <div 
            key={e.id} 
            className="card-elegant overflow-hidden cursor-pointer transition-all"
            onClick={() => toggleExpand(e.id)}
          >
            {/* Main Info - Always Visible */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">
                    {e.appointments?.client_name || "Cliente"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {parseDateString(e.entry_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                  + R$ {Number(e.amount).toFixed(2).replace(".", ",")}
                </span>
                {expandedId === e.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Expanded Info */}
            <AnimatePresence>
              {expandedId === e.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <CreditCard className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Forma de Pagamento</p>
                        <p className="font-medium" style={{ color: paymentColors[e.payment_method] }}>
                          {paymentLabels[e.payment_method] || e.payment_method}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Briefcase className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Serviço</p>
                        <p className="font-medium">{e.service_name}</p>
                      </div>
                    </div>
                    {e.appointments?.appointment_time && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Horário</p>
                          <p className="font-medium">{e.appointments.appointment_time.slice(0, 5)}</p>
                        </div>
                      </div>
                    )}
                    {e.appointments?.appointment_date && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Data do Agendamento</p>
                          <p className="font-medium">{parseDateString(e.appointments.appointment_date)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {!entries?.length && (
          <div className="card-elegant p-8 text-center text-muted-foreground">
            Nenhuma entrada encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
