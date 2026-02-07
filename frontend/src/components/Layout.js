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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
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
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                                    <Tag className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-slate-900 hidden sm:block" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    PriceHive
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation - Responsive con 3 niveles */}
                        <TooltipProvider delayDuration={200}>
                            <div className="hidden md:flex items-center gap-0.5 lg:gap-1 flex-1 justify-center max-w-2xl">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    const hasNotification = item.path === "/alerts" && unreadCount > 0;
                                    
                                    return (
                                        <Tooltip key={item.path}>
                                            <TooltipTrigger asChild>
                                                <Link to={item.path} className="flex-shrink-0">
                                                    <Button
                                                        variant={isActive ? "default" : "ghost"}
                                                        size="sm"
                                                        className={`relative gap-2 transition-all ${
                                                            isActive 
                                                                ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                                                                : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                                                        }`}
                                                        data-testid={`nav-${item.path.slice(1)}`}
                                                    >
                                                        <span className="relative">
                                                            {item.icon}
                                                            {hasNotification && (
                                                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"></span>
                                                            )}
                                                        </span>
                                                        {/* Texto visible solo en pantallas grandes (lg+) */}
                                                        <span className="hidden lg:inline">
                                                            {item.label}
                                                        </span>
                                                        {/* Badge de notificaciones solo visible en lg+ */}
                                                        {hasNotification && (
                                                            <span className="hidden lg:flex w-5 h-5 rounded-full bg-rose-500 text-white text-xs items-center justify-center">
                                                                {unreadCount > 9 ? "9+" : unreadCount}
                                                            </span>
                                                        )}
                                                    </Button>
                                                </Link>
                                            </TooltipTrigger>
                                            {/* Tooltip visible solo cuando el texto está oculto (md-lg) */}
                                            <TooltipContent className="lg:hidden">
                                                <p>{item.label}</p>
                                                {hasNotification && (
                                                    <span className="ml-2 text-rose-500">({unreadCount})</span>
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </TooltipProvider>

                        {/* Right Side - User Info */}
                        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                            {/* Points Badge */}
                            <div className="hidden sm:flex items-center gap-1 px-2 lg:px-3 py-1.5 bg-emerald-50 rounded-full">
                                <Star className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span className="font-mono text-xs lg:text-sm font-medium text-emerald-600">
                                    {user?.points || 0}
                                </span>
                            </div>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="flex items-center gap-1.5 lg:gap-2 px-1.5 lg:px-2">
                                        <Avatar className="w-7 h-7 lg:w-8 lg:h-8">
                                            <AvatarImage src={user?.picture} />
                                            <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xs lg:text-sm">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden xl:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                                            {user?.name}
                                        </span>
                                        {user?.role === 'admin' && (
                                            <span className="hidden xl:inline px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                Admin
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <div className="px-2 py-1.5 text-sm">
                                        <p className="font-medium text-slate-900">{user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
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
                                className="md:hidden h-9 w-9"
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
                    <div className="md:hidden border-t border-slate-200 bg-white shadow-lg">
                        <div className="px-3 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                            {/* User info en móvil */}
                            <div className="flex items-center gap-3 px-3 py-3 bg-emerald-50 rounded-lg mb-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={user?.picture} />
                                    <AvatarFallback className="bg-emerald-100 text-emerald-600">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Star className="w-3 h-3 text-emerald-500" />
                                        <span className="text-xs font-mono text-emerald-600">{user?.points || 0} pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation items */}
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                const hasNotification = item.path === "/alerts" && unreadCount > 0;
                                
                                return (
                                    <Link 
                                        key={item.path} 
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button
                                            variant={isActive ? "default" : "ghost"}
                                            className={`w-full justify-start gap-3 h-11 ${
                                                isActive 
                                                    ? "bg-emerald-500 text-white" 
                                                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                                            }`}
                                        >
                                            <span className="relative">
                                                {item.icon}
                                                {hasNotification && (
                                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"></span>
                                                )}
                                            </span>
                                            <span className="flex-1 text-left">{item.label}</span>
                                            {hasNotification && (
                                                <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">
                                                    {unreadCount > 9 ? "9+" : unreadCount}
                                                </span>
                                            )}
                                        </Button>
                                    </Link>
                                );
                            })}
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
