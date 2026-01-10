import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminServicos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", duration: "" });

  const { data: services } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => { 
      const { data } = await supabase.from("services").select("*").order("name"); 
      return data || []; 
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, price: parseFloat(form.price), duration: parseInt(form.duration) };
      if (editing) await supabase.from("services").update(payload).eq("id", editing.id);
      else await supabase.from("services").insert(payload);
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["admin-services"] }); 
      setOpen(false); 
      resetForm(); 
      toast({ title: "Salvo!" }); 
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { 
      await supabase.from("services").delete().eq("id", id); 
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["admin-services"] }); 
      toast({ title: "Excluído!" }); 
    },
  });

  const resetForm = () => { 
    setForm({ name: "", description: "", price: "", duration: "" }); 
    setEditing(null); 
  };
  
  const openEdit = (s: any) => { 
    setEditing(s); 
    setForm({ name: s.name, description: s.description || "", price: s.price, duration: s.duration }); 
    setOpen(true); 
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <h1 className="font-display text-2xl lg:text-3xl font-bold">Serviços</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="self-start">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Novo </span>Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Novo"} Serviço</DialogTitle>
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
                  <Label>Preço (R$)</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div>
                  <Label>Duração (min)</Label>
                  <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 lg:gap-4">
        {services?.map((s) => (
          <div key={s.id} className="card-elegant p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{s.name}</h3>
              <p className="text-sm text-muted-foreground">
                R$ {Number(s.price).toFixed(2).replace(".", ",")} • {s.duration} min
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(s.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
