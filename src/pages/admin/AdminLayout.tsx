import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Calendar, DollarSign, Tag, Settings, LogOut, Sparkles, Menu, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/admin/promocoes", label: "Promoções", icon: Tag },
  { href: "/admin/servicos", label: "Serviços", icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate("/admin/login");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Sparkles className="w-8 h-8 text-primary animate-pulse" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 p-4 lg:p-6 border-b border-border">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display text-lg font-semibold">Admin</span>
        </div>
        <nav className="p-2 lg:p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${location.pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />Sair
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-w-0">
        <header className="sticky top-0 z-40 bg-card border-b border-border p-3 lg:p-4 flex items-center justify-between">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors" title="Voltar para Home">
              <Home className="w-5 h-5" />
            </Link>
            <ThemeToggle />
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary hidden sm:block">Ver site</Link>
          </div>
        </header>
        <main className="p-4 lg:p-6 overflow-x-hidden"><Outlet /></main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
