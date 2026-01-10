import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminPromocoes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    original_price: "", 
    promotional_price: "", 
    valid_until: "", 
    active: true 
  });

  const { data: promotions } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => { 
      const { data } = await supabase.from("promotions").select("*").order("created_at", { ascending: false }); 
      return data || []; 
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { 
        ...form, 
        original_price: parseFloat(form.original_price), 
        promotional_price: parseFloat(form.promotional_price) 
      };
      if (editing) await supabase.from("promotions").update(payload).eq("id", editing.id);
      else await supabase.from("promotions").insert(payload);
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] }); 
      setOpen(false); 
      resetForm(); 
      toast({ title: "Salvo!" }); 
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { 
      await supabase.from("promotions").delete().eq("id", id); 
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] }); 
      toast({ title: "Excluído!" }); 
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => { 
      await supabase.from("promotions").update({ active }).eq("id", id); 
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-promotions"] }),
  });

  const resetForm = () => { 
    setForm({ 
      name: "", 
      description: "", 
      original_price: "", 
      promotional_price: "", 
      valid_until: "", 
      active: true 
    }); 
    setEditing(null); 
  };
  
  const openEdit = (p: any) => { 
    setEditing(p); 
    setForm({ 
      name: p.name, 
      description: p.description || "", 
      original_price: p.original_price, 
      promotional_price: p.promotional_price, 
      valid_until: p.valid_until, 
      active: p.active 
    }); 
    setOpen(true); 
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <h1 className="font-display text-2xl lg:text-3xl font-bold">Promoções</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="self-start">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nova </span>Promoção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Nova"} Promoção</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço Original</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={form.original_price} 
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label>Preço Promocional</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={form.promotional_price} 
                    onChange={(e) => setForm({ ...form, promotional_price: e.target.value })} 
                    required 
                  />
                </div>
              </div>
              <div>
                <Label>Válido até</Label>
                <Input 
                  type="date" 
                  value={form.valid_until} 
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 lg:gap-4">
        {promotions?.map((p) => (
          <div key={p.id} className="card-elegant p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{p.name}</h3>
              <p className="text-sm text-muted-foreground">
                R$ {Number(p.promotional_price).toFixed(2).replace(".", ",")} 
                <span className="line-through ml-2 opacity-60">
                  R$ {Number(p.original_price).toFixed(2).replace(".", ",")}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3 lg:gap-4 self-end sm:self-auto">
              <Switch 
                checked={p.active} 
                onCheckedChange={(v) => toggleActive.mutate({ id: p.id, active: v })} 
              />
              <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(p.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
