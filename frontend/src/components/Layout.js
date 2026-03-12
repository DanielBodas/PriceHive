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
    Hexagon,
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
    ];

    const navItems = baseNavItems;

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
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary border-b border-white/10 shadow-lg">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Link to="/dashboard" className="flex items-center gap-2 group">
                                <div className="relative flex items-center justify-center transition-transform group-hover:scale-105">
                                    <Hexagon className="w-9 h-9 text-primary fill-primary/20" strokeWidth={2.5} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    </div>
                                </div>
                                <span className="text-xl font-extrabold tracking-tight text-white hidden sm:block font-heading uppercase tracking-widest">
                                    Enjambre
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
                                                        className={`relative gap-2 transition-all btn-lift ${isActive
                                                                ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                                                                : "text-white/70 hover:text-primary hover:bg-white/5"
                                                            }`}
                                                        data-testid={`nav-${item.path.slice(1)}`}
                                                    >
                                                        <span className="relative">
                                                            {item.icon}
                                                            {hasNotification && (
                                                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 border-2 border-secondary"></span>
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
                            <div className="hidden sm:flex items-center gap-1 px-2 lg:px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                                <span className="font-mono text-xs lg:text-sm font-bold text-primary">
                                    {user?.points || 0}
                                </span>
                            </div>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="flex items-center gap-1.5 lg:gap-2 px-1.5 lg:px-2 hover:bg-white/5">
                                        <Avatar className="w-7 h-7 lg:w-8 lg:h-8 border border-white/10">
                                            <AvatarImage src={user?.picture} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs lg:text-sm font-bold">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden xl:block text-sm font-semibold text-white max-w-[120px] truncate">
                                            {user?.name}
                                        </span>
                                        {user?.role === 'admin' && (
                                            <span className="hidden xl:inline px-2 py-0.5 bg-primary text-white text-[10px] uppercase tracking-wider font-bold rounded-md">
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
                                    {user?.role === 'admin' && (
                                        <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Admin
                                        </DropdownMenuItem>
                                    )}
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
                                className="md:hidden h-9 w-9 text-white hover:bg-white/5"
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
                    <div className="md:hidden border-t border-border bg-white shadow-xl animate-fade-in-up">
                        <div className="px-3 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                            {/* User info en móvil */}
                            <div className="flex items-center gap-3 px-3 py-3 bg-primary/5 rounded-xl mb-3 border border-primary/10">
                                <Avatar className="w-10 h-10 border border-border">
                                    <AvatarImage src={user?.picture} />
                                    <AvatarFallback className="bg-primary text-white">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-secondary truncate">{user?.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Star className="w-3 h-3 text-primary fill-primary" />
                                        <span className="text-xs font-mono font-bold text-primary">{user?.points || 0} pts</span>
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
                                            className={`w-full justify-start gap-3 h-11 rounded-xl ${isActive
                                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
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


                            <div className="h-px bg-slate-200 my-2"></div>

                            <Link
                                to="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Button
                                    variant={location.pathname === "/profile" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 h-11 rounded-xl ${location.pathname === "/profile"
                                            ? "bg-primary text-white"
                                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                        }`}
                                >
                                    <User className="w-5 h-5" />
                                    <span className="flex-1 text-left">Mi Perfil</span>
                                </Button>
                            </Link>

                            <Link
                                to="/alerts"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Button
                                    variant={location.pathname === "/alerts" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 h-11 rounded-xl ${location.pathname === "/alerts"
                                            ? "bg-primary text-white"
                                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                        }`}
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="flex-1 text-left">Notificaciones</span>
                                    {unreadCount > 0 && (
                                        <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>

                            {user?.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Button
                                        variant={location.pathname === "/admin" ? "default" : "ghost"}
                                        className={`w-full justify-start gap-3 h-11 rounded-xl ${location.pathname === "/admin"
                                                ? "bg-primary text-white"
                                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                            }`}
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span className="flex-1 text-left">Admin</span>
                                    </Button>
                                </Link>
                            )}

                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="w-full justify-start gap-3 h-11 text-rose-600 hover:bg-rose-50 hover:text-rose-700 mt-1"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="flex-1 text-left">Cerrar Sesión</span>
                            </Button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="pt-16 min-h-screen hive-pattern bee-stripe">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
