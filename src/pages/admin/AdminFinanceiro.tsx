import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminFinanceiro() {
  const { data: entries } = useQuery({
    queryKey: ["financial-entries"],
    queryFn: async () => {
      const { data } = await supabase.from("financial_entries").select("*").order("entry_date", { ascending: false });
      return data || [];
    },
  });

  const paymentLabels: Record<string, string> = { cash: "Dinheiro", pix: "PIX", credit_card: "Crédito", debit_card: "Débito" };
  const total = entries?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Financeiro</h1>
        <div className="card-elegant px-6 py-3"><span className="text-muted-foreground">Total:</span> <span className="text-2xl font-bold text-primary ml-2">R$ {total.toFixed(2).replace(".", ",")}</span></div>
      </div>
      <div className="card-elegant overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Data</th>
              <th className="text-left p-4 font-medium">Serviço</th>
              <th className="text-left p-4 font-medium">Valor</th>
              <th className="text-left p-4 font-medium">Pagamento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries?.map((e) => (
              <tr key={e.id} className="hover:bg-muted/30">
                <td className="p-4">{new Date(e.entry_date).toLocaleDateString("pt-BR")}</td>
                <td className="p-4">{e.service_name}</td>
                <td className="p-4 text-green-600 font-medium">+ R$ {Number(e.amount).toFixed(2).replace(".", ",")}</td>
                <td className="p-4">{paymentLabels[e.payment_method] || e.payment_method}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!entries?.length && <p className="p-8 text-center text-muted-foreground">Nenhuma entrada encontrada.</p>}
      </div>
    </div>
  );
}
