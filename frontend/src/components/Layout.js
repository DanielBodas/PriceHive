import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { 
    Tag, 
    LayoutDashboard, 
    MessageSquare, 
    ShoppingCart, 
    BarChart3, 
    Settings, 
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";

const Layout = ({ children }) => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: "/feed", label: "Muro", icon: <MessageSquare className="w-5 h-5" /> },
        { path: "/shopping-list", label: "Lista de Compra", icon: <ShoppingCart className="w-5 h-5" /> },
        { path: "/analytics", label: "Análisis", icon: <BarChart3 className="w-5 h-5" /> },
    ];

    if (isAdmin()) {
        navItems.push({ path: "/admin", label: "Admin", icon: <Settings className="w-5 h-5" /> });
    }

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                                    <Tag className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-slate-900 hidden sm:block" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    PriceHive
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link key={item.path} to={item.path}>
                                    <Button
                                        variant={location.pathname === item.path ? "default" : "ghost"}
                                        className={`gap-2 ${
                                            location.pathname === item.path 
                                                ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                                                : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                                        }`}
                                        data-testid={`nav-${item.path.slice(1)}`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Button>
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{user?.name}</span>
                                {isAdmin() && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={handleLogout}
                                className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                data-testid="logout-btn"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                            
                            {/* Mobile menu button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                data-testid="mobile-menu-btn"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-white">
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => (
                                <Link 
                                    key={item.path} 
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Button
                                        variant={location.pathname === item.path ? "default" : "ghost"}
                                        className={`w-full justify-start gap-3 ${
                                            location.pathname === item.path 
                                                ? "bg-emerald-500 text-white" 
                                                : "text-slate-600"
                                        }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="pt-16 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
