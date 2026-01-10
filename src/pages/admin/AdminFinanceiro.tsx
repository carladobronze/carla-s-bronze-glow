import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function AdminFinanceiro() {
  const { data: entries } = useQuery({
    queryKey: ["financial-entries"],
    queryFn: async () => {
      const { data } = await supabase.from("financial_entries").select("*").order("entry_date", { ascending: false });
      return data || [];
    },
  });

  const paymentLabels: Record<string, string> = { 
    cash: "Dinheiro", 
    pix: "PIX", 
    credit_card: "Crédito", 
    debit_card: "Débito" 
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

      {/* Entries Table */}
      <div className="card-elegant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 lg:p-4 font-medium">Data</th>
                <th className="text-left p-3 lg:p-4 font-medium hidden sm:table-cell">Serviço</th>
                <th className="text-left p-3 lg:p-4 font-medium">Valor</th>
                <th className="text-left p-3 lg:p-4 font-medium">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries?.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30">
                  <td className="p-3 lg:p-4 whitespace-nowrap">{parseDateString(e.entry_date)}</td>
                  <td className="p-3 lg:p-4 hidden sm:table-cell truncate max-w-[150px]">{e.service_name}</td>
                  <td className="p-3 lg:p-4 text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                    + R$ {Number(e.amount).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="p-3 lg:p-4">
                    <span 
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${paymentColors[e.payment_method]}20`,
                        color: paymentColors[e.payment_method],
                      }}
                    >
                      {paymentLabels[e.payment_method] || e.payment_method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!entries?.length && (
            <p className="p-6 lg:p-8 text-center text-muted-foreground text-sm">Nenhuma entrada encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
