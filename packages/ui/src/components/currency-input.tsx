"use client";

import * as React from "react";
import { Input } from "./input";
import { cn } from "../lib/utils";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onChange?: (value: number) => void;
  currency?: string;
  locale?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      className,
      value = 0,
      onChange,
      currency = "ARS",
      locale = "es-AR",
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(formatCurrency(value, currency, locale));
      }
    }, [value, currency, locale]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Remover todo excepto números y punto decimal
      const numericValue = inputValue.replace(/[^\d.,]/g, "").replace(",", ".");

      // Convertir a número
      const numberValue = parseFloat(numericValue) || 0;

      // Actualizar display
      setDisplayValue(formatCurrency(numberValue, currency, locale));

      // Llamar onChange con el valor numérico
      if (onChange) {
        onChange(numberValue);
      }
    };

    return (
      <div className="relative">
        <Input
          type="text"
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          className={cn("pr-12", className)}
          {...props}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-muted-foreground text-sm">{currency}</span>
        </div>
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

function formatCurrency(
  value: number,
  currency: string,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export { CurrencyInput };
