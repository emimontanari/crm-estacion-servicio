"use client";

import * as React from "react";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Label } from "../label";
import { Card } from "../card";
import { cn } from "../../lib/utils";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Building,
  Receipt,
} from "lucide-react";

export interface PaymentMethod {
  id: string;
  name: string;
  type: "cash" | "credit_card" | "debit_card" | "mobile_payment" | "transfer" | "check";
  enabled: boolean;
  fee?: number;
}

export interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const icons = {
  cash: Banknote,
  credit_card: CreditCard,
  debit_card: CreditCard,
  mobile_payment: Smartphone,
  transfer: Building,
  check: Receipt,
};

const PaymentMethodSelector = React.forwardRef<
  HTMLDivElement,
  PaymentMethodSelectorProps
>(({ className, methods, value, onChange }, ref) => {
  const enabledMethods = methods.filter((m) => m.enabled);

  return (
    <div ref={ref} className={cn("space-y-3", className)}>
      <RadioGroup value={value} onValueChange={onChange}>
        {enabledMethods.map((method) => {
          const Icon = icons[method.type];
          return (
            <Card
              key={method.id}
              className={cn(
                "relative cursor-pointer transition-all hover:bg-accent",
                value === method.id && "border-primary bg-accent"
              )}
            >
              <label
                htmlFor={method.id}
                className="flex items-center gap-4 p-4 cursor-pointer"
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={method.id}
                      className="text-base font-medium cursor-pointer"
                    >
                      {method.name}
                    </Label>
                    {method.fee && method.fee > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Comisión: {(method.fee * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </label>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );
});

PaymentMethodSelector.displayName = "PaymentMethodSelector";

export { PaymentMethodSelector };
