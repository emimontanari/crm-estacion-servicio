"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentRole } from "@/modules/auth/hooks/use-current-role";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Gift,
  FileText,
  Settings,
  TrendingUp,
  CreditCard,
  Building2,
  UserCog,
  Star,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: string[];
  badge?: string;
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "manager", "cashier", "viewer"],
  },
  {
    title: "Ventas",
    href: "/ventas",
    icon: ShoppingCart,
    allowedRoles: ["admin", "manager", "cashier"],
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
    allowedRoles: ["admin", "manager", "cashier"],
  },
  {
    title: "Inventario",
    href: "/inventario",
    icon: Package,
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Fidelización",
    href: "/fidelizacion",
    icon: Star,
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: TrendingUp,
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Configuración",
    href: "/configuracion",
    icon: Settings,
    allowedRoles: ["admin", "manager"],
  },
];

const configurationSubItems: NavItem[] = [
  {
    title: "Usuarios",
    href: "/configuracion/usuarios",
    icon: UserCog,
    allowedRoles: ["admin"],
  },
  {
    title: "Organización",
    href: "/configuracion/organizacion",
    icon: Building2,
    allowedRoles: ["admin"],
  },
  {
    title: "Métodos de Pago",
    href: "/configuracion/metodos-pago",
    icon: CreditCard,
    allowedRoles: ["admin"],
  },
  {
    title: "Fidelización",
    href: "/configuracion/fidelizacion",
    icon: Gift,
    allowedRoles: ["admin", "manager"],
  },
];

export function NavigationSidebar() {
  const pathname = usePathname();
  const { role, isLoading } = useCurrentRole();

  if (isLoading) {
    return (
      <aside className="w-64 border-r bg-card h-screen sticky top-0">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </div>
      </aside>
    );
  }

  // Filter items based on user role
  const visibleItems = navigationItems.filter((item) =>
    role ? item.allowedRoles.includes(role) : false
  );

  const visibleConfigItems = configurationSubItems.filter((item) =>
    role ? item.allowedRoles.includes(role) : false
  );

  const isConfigRoute = pathname?.startsWith("/configuracion");

  return (
    <aside className="w-64 border-r bg-card h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">Navegación</h2>

        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isConfigItem = item.href === "/configuracion";

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Show config subitems when on config route */}
                {isConfigItem && isConfigRoute && visibleConfigItems.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {visibleConfigItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href;

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            isSubActive
                              ? "bg-primary/90 text-primary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                          )}
                        >
                          <SubIcon className="h-4 w-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Role indicator */}
        <div className="mt-6 pt-6 border-t">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Rol actual:</p>
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-muted">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="capitalize">
                {role === "admin" && "Administrador"}
                {role === "manager" && "Gerente"}
                {role === "cashier" && "Cajero"}
                {role === "viewer" && "Visualizador"}
                {role === "customer" && "Cliente"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
