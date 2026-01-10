import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Banknote, QrCode, CreditCard, Wallet } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PaymentMethod = Database["public"]["Enums"]["payment_method"];

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (method: PaymentMethod) => void;
  appointmentInfo: {
    clientName: string;
    serviceName: string;
    price: number;
  };
}

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ComponentType<any>; color: string }[] = [
  { value: "cash", label: "Dinheiro", icon: Banknote, color: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" },
  { value: "pix", label: "PIX", icon: QrCode, color: "bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-400" },
  { value: "credit_card", label: "Cartão de Crédito", icon: CreditCard, color: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "debit_card", label: "Cartão de Débito", icon: Wallet, color: "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400" },
];

export function PaymentMethodDialog({ open, onOpenChange, onSelect, appointmentInfo }: PaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Forma de Pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 space-y-1">
            <p className="font-medium">{appointmentInfo.clientName}</p>
            <p className="text-sm text-muted-foreground">{appointmentInfo.serviceName}</p>
            <p className="text-lg font-bold text-primary">
              R$ {appointmentInfo.price.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">Como o cliente pagou?</p>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <Button
                key={method.value}
                variant="outline"
                className={`h-auto py-4 flex flex-col items-center gap-2 ${method.color}`}
                onClick={() => onSelect(method.value)}
              >
                <method.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{method.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
