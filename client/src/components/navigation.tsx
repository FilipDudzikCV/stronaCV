import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Strona główna", tab: "home" },
  { path: "/sell", label: "Sprzedaj", tab: "sell" },
  { path: "/messages", label: "Wiadomości", tab: "messages", badge: 3 },
  { path: "/profile", label: "Profil", tab: "profile" },
];

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <Megaphone className="h-6 w-6" />
            <span>Ogłoszenia</span>
          </Link>
          
          <nav className="hidden md:flex gap-3">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "relative transition-colors",
                    location === item.path && "nav-active"
                  )}
                >
                  {item.label}
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    location === item.path && "nav-active"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                  {item.badge && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
