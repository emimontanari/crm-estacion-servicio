import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard";
import { NavigationSidebar } from "@/components/sidebar/navigation-sidebar";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard>
      <OrganizationGuard>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <NavigationSidebar />

          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            {/* Top header */}
            <header className="border-b bg-card sticky top-0 z-40">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-semibold">CRM Estación de Servicio</h1>
                </div>
                <div className="flex items-center gap-4">
                  <OrganizationSwitcher
                    afterCreateOrganizationUrl="/dashboard"
                    afterSelectOrganizationUrl="/dashboard"
                  />
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 bg-background">{children}</main>
          </div>
        </div>
      </OrganizationGuard>
    </AuthGuard>
  );
};

export default Layout;
