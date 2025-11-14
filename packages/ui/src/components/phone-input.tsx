"use client";

import * as React from "react";
import { Input } from "./input";
import { cn } from "../lib/utils";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string;
  onChange?: (value: string) => void;
  countryCode?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, countryCode = "+54", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      if (value) {
        setDisplayValue(formatPhoneNumber(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Remover todo excepto números
      const numericValue = inputValue.replace(/\D/g, "");

      // Limitar a 10 dígitos
      const limitedValue = numericValue.slice(0, 10);

      // Formatear para display
      setDisplayValue(formatPhoneNumber(limitedValue));

      // Llamar onChange con el valor sin formato
      if (onChange) {
        onChange(limitedValue);
      }
    };

    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-muted-foreground text-sm">{countryCode}</span>
        </div>
        <Input
          type="tel"
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          className={cn("pl-16", className)}
          placeholder="11 1234-5678"
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

function formatPhoneNumber(value: string): string {
  if (!value) return "";

  // Formato para Argentina: XX XXXX-XXXX
  if (value.length <= 2) {
    return value;
  } else if (value.length <= 6) {
    return `${value.slice(0, 2)} ${value.slice(2)}`;
  } else {
    return `${value.slice(0, 2)} ${value.slice(2, 6)}-${value.slice(6, 10)}`;
  }
}

export { PhoneInput };
