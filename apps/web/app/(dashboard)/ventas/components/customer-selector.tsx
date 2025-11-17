"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
} from "@workspace/ui";
import { User, X, Search } from "lucide-react";

interface CustomerSelectorProps {
  selectedCustomer: any;
  onSelectCustomer: (customer: any) => void;
}

export function CustomerSelector({
  selectedCustomer,
  onSelectCustomer,
}: CustomerSelectorProps) {
  const [searchPhone, setSearchPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchResults = useQuery(
    api.customers.searchByPhone,
    searchPhone.length >= 3 ? { phone: searchPhone } : "skip"
  );

  const handleSearch = () => {
    if (searchPhone.length >= 3) {
      setIsSearching(true);
    }
  };

  const handleSelectCustomer = (customer: any) => {
    onSelectCustomer(customer);
    setSearchPhone("");
    setIsSearching(false);
  };

  const handleClearCustomer = () => {
    onSelectCustomer(null);
    setSearchPhone("");
    setIsSearching(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedCustomer ? (
          <div className="p-3 border rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{selectedCustomer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.phone}
                </p>
                {selectedCustomer.email && (
                  <p className="text-xs text-muted-foreground">
                    {selectedCustomer.email}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearCustomer}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedCustomer.loyaltyPoints} puntos
              </Badge>
              <Badge variant="outline">
                ${selectedCustomer.totalSpent?.toLocaleString("es-AR") || 0}
                gastado
              </Badge>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por teléfono..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button size="sm" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {isSearching && searchResults && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No se encontraron clientes
                  </p>
                ) : (
                  searchResults.map((customer) => (
                    <div
                      key={customer._id}
                      className="p-2 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.phone}
                      </p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {customer.loyaltyPoints} pts
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Opcional: Asociar venta a un cliente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
