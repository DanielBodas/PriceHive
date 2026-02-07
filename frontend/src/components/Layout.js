import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
    Tag, 
    LayoutDashboard, 
    MessageSquare, 
    ShoppingCart, 
    BarChart3, 
    Settings, 
    LogOut,
    Menu,
    X,
    Bell,
    User,
    Star
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const baseNavItems = [
        { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: "/feed", label: "Muro", icon: <MessageSquare className="w-5 h-5" /> },
        { path: "/shopping-list", label: "Lista de Compra", icon: <ShoppingCart className="w-5 h-5" /> },
        { path: "/analytics", label: "Análisis", icon: <BarChart3 className="w-5 h-5" /> },
        { path: "/alerts", label: "Alertas", icon: <Bell className="w-5 h-5" /> },
    ];

    const navItems = user?.role === 'admin' 
        ? [...baseNavItems, { path: "/admin", label: "Admin", icon: <Settings className="w-5 h-5" /> }]
        : baseNavItems;

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await axios.get(`${API}/notifications/unread-count`);
                setUnreadCount(response.data.count);
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };

        fetchUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        await logout();
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
                                        {item.path === "/alerts" && unreadCount > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Points Badge */}
                            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-full">
                                <Star className="w-4 h-4 text-emerald-500" />
                                <span className="font-mono text-sm font-medium text-emerald-600">
                                    {user?.points || 0}
                                </span>
                            </div>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={user?.picture} />
                                            <AvatarFallback className="bg-emerald-100 text-emerald-600 text-sm">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden sm:block text-sm font-medium text-slate-700">
                                            {user?.name}
                                        </span>
                                        {user?.role === 'admin' && (
                                            <span className="hidden sm:inline px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                Admin
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                                        <User className="w-4 h-4 mr-2" />
                                        Mi Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/alerts')} className="cursor-pointer">
                                        <Bell className="w-4 h-4 mr-2" />
                                        Notificaciones
                                        {unreadCount > 0 && (
                                            <span className="ml-auto w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-rose-600">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Cerrar Sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            
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
