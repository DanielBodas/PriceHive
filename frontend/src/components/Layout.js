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
    const [logoClicks, setLogoClicks] = useState(0);
    const [showRain, setShowRain] = useState(false);

    const baseNavItems = [
        { path: "/dashboard", label: "Inicio", icon: <LayoutDashboard className="w-5 h-5" /> },
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
        <div className="min-h-screen bg-background hive-pattern">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="flex items-center justify-between h-12">
                        {/* Logo */}
                        <div className="flex items-center flex-shrink-0 -ml-2">
                            <button 
                                onClick={(e) => {
                                    setLogoClicks(prev => {
                                        const next = prev + 1;
                                        if (next >= 5) {
                                            setShowRain(true);
                                            setTimeout(() => setShowRain(false), 5000);
                                            return 0;
                                        }
                                        return next;
                                    });
                                }}
                                className="group relative z-50 focus:outline-none"
                            >
                                <img 
                                    src="/logo.png" 
                                    alt="PriceHive" 
                                    className="h-24 w-auto object-contain transition-all group-hover:scale-105 drop-shadow-md" 
                                />
                            </button>
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
                                                        className={`relative gap-2 transition-all font-semibold ${isActive
                                                                ? "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20"
                                                                : "text-slate-600 hover:text-primary hover:bg-primary/5"
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
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                <Star className="w-3.5 h-3.5 text-primary fill-primary flex-shrink-0" />
                                <span className="font-mono text-xs font-bold text-primary">
                                    {user?.points || 0}
                                </span>
                            </div>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="flex items-center gap-1.5 lg:gap-2 px-1.5 lg:px-2">
                                        <Avatar className="w-7 h-7 lg:w-8 lg:h-8 border border-slate-200 shadow-sm">
                                            <AvatarImage src={user?.picture} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs lg:text-sm font-bold">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden xl:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                                            {user?.name}
                                        </span>
                                        {user?.role === 'admin' && (
                                            <span className="hidden xl:inline px-2 py-0.5 bg-primary/20 text-primary text-[10px] uppercase tracking-wider font-bold rounded-full border border-primary/20">
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
                            <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-2xl mb-4 border border-primary/20 shadow-inner">
                                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={user?.picture} />
                                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
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
                                            className={`w-full justify-start gap-4 h-12 rounded-xl transition-all ${isActive
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                    : "text-slate-600 hover:bg-primary/10 hover:text-primary"
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
                                    className={`w-full justify-start gap-4 h-12 rounded-xl ${location.pathname === "/profile"
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-slate-600 hover:bg-primary/10 hover:text-primary"
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
                                    className={`w-full justify-start gap-3 h-11 ${location.pathname === "/alerts"
                                            ? "bg-primary text-white"
                                            : "text-slate-600 hover:bg-primary/10 hover:text-primary"
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
                                        className={`w-full justify-start gap-3 h-11 ${location.pathname === "/admin"
                                                ? "bg-primary text-white"
                                                : "text-slate-600 hover:bg-primary/10 hover:text-primary"
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
            <main className="pt-12 min-h-screen pb-[env(safe-area-inset-bottom)]">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
                    {children}
                </div>
            </main>
            
            {/* Honey Rain Easter Egg */}
            {showRain && <HoneyRain />}
        </div>
    );
};

const HoneyRain = () => {
    const bees = Array.from({ length: 20 });
    return (
        <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
            {bees.map((_, i) => (
                <img
                    key={i}
                    src="/icon.png"
                    alt=""
                    className="absolute w-8 h-8 opacity-60 animate-fall"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: '-10%',
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 2}s`
                    }}
                />
            ))}
        </div>
    );
};

export default Layout;
