import { Button } from "@/components/ui/button";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useStaffAuth } from "../hooks/useStaffAuth";

export default function SiteHeader() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useStaffAuth();

  const currentPath = routerState.location.pathname;
  const isStaffPage = currentPath === "/staff";

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Book Appointment", path: "/book" },
    { label: "Staff", path: "/staff" },
  ];

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/generated/vijaya-logo.dim_200x200.png"
              alt="Vijaya Children's Clinic"
              className="h-12 w-auto object-contain"
            />
            <span className="font-bold text-lg hidden sm:inline text-primary">
              Vijaya Children's Clinic
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={currentPath === item.path ? "default" : "ghost"}
                onClick={() => navigate({ to: item.path })}
              >
                {item.label}
              </Button>
            ))}
            {isAuthenticated && isStaffPage && (
              <Button variant="outline" onClick={handleLogout} className="ml-2">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={currentPath === item.path ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    navigate({ to: item.path });
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
              {isAuthenticated && isStaffPage && (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
