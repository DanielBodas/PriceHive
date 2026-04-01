import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { ShoppingCart, TrendingDown, Users, BarChart3, Shield, Hexagon, ArrowRight, Zap, Globe, Sparkles } from "lucide-react";

const LandingPage = () => {
    const { loginWithGoogle } = useAuth();

    const features = [
        {
            icon: <Users className="w-6 h-6" />,
            title: "Inteligencia Colectiva",
            description: "Nuestra comunidad actúa como un enjambre, compartiendo precios reales para que todos se beneficien."
        },
        {
            icon: <TrendingDown className="w-6 h-6" />,
            title: "Ahorro Colaborativo",
            description: "Encuentra el precio más bajo detectado por otros usuarios en tu zona de forma instantánea."
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Alertas en Tiempo Real",
            description: "Recibe notificaciones cuando los productos de tu lista bajen de precio o sufran subidas injustificadas."
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Transparencia Total",
            description: "Visualiza el histórico real de precios y detecta patrones de ofertas engañosas."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 group">
                        <Hexagon className="w-8 h-8 text-primary fill-primary/10" strokeWidth={2.5} />
                        <span className="text-xl font-bold tracking-tight text-slate-900 font-heading">
                            Price<span className="text-primary">Hive</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-slate-600 hover:text-primary font-semibold" data-testid="login-nav-btn">
                                Iniciar Sesión
                            </Button>
                        </Link>
                        <Button 
                            onClick={loginWithGoogle}
                            className="rounded-xl px-6 font-bold shadow-sm"
                            data-testid="register-nav-btn"
                        >
                            Empezar con Google
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-slate-50">
                <div className="max-w-7xl mx-auto relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-[10px] font-bold mb-6 tracking-widest uppercase">
                                <Sparkles className="w-3 h-3 text-primary" />
                                Inteligencia Colectiva de Precios
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight font-heading">
                                La transparencia de precios <span className="text-primary">definitiva</span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                                No más falsas ofertas. Únete a miles de usuarios que colaboran para compartir precios reales de supermercados en tiempo real.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button 
                                    size="lg" 
                                    className="rounded-xl px-8 h-14 text-base font-bold shadow-md"
                                    data-testid="hero-cta-btn"
                                    onClick={loginWithGoogle}
                                >
                                    Empezar a ahorrar
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Link to="/login">
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        className="rounded-xl px-8 h-14 text-base border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold"
                                        data-testid="hero-login-btn"
                                    >
                                        Iniciar Sesión
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative animate-fade-in-up animate-delay-200">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1601599963565-b7ba29c8e3ff?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" 
                                    alt="Supermercado"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-2xl border border-border/40 animate-pulse-soft">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <TrendingDown className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ahorro medio</p>
                                        <p className="text-3xl font-black text-secondary tracking-tight">-23%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 bg-white relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight font-heading">
                            Poder compartido, ahorro multiplicado
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            PriceHive utiliza datos en tiempo real aportados por la comunidad para que nunca más vuelvas a pagar de más.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className={`bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up`}
                                style={{ animationDelay: `${index * 100}ms` }}
                                data-testid={`feature-card-${index}`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary mb-6 shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 font-heading">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight font-heading">
                            Cómo funciona PriceHive
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "Planificación", desc: "Añade productos a tu lista inteligente y recibe estimaciones basadas en datos reales.", icon: <ShoppingCart className="w-5 h-5" /> },
                            { step: "02", title: "Colaboración", desc: "Registra precios durante tu compra de forma rápida. Tu aporte ayuda a toda la comunidad.", icon: <Globe className="w-5 h-5" /> },
                            { step: "03", title: "Recompensa", desc: "Gana puntos por cada aporte, sube de nivel y desbloquea análisis avanzados.", icon: <Sparkles className="w-5 h-5" /> }
                        ].map((item, index) => (
                            <div key={index} className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-6">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 font-heading">
                                    {item.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 bg-primary">
                <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight font-heading">
                        ¿Listo para empezar a ahorrar?
                    </h2>
                    <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
                        Únete a la comunidad de PriceHive y toma el control de tus gastos hoy mismo.
                    </p>
                    <Button 
                        size="lg" 
                        className="rounded-xl px-12 h-16 text-lg font-bold bg-white text-primary hover:bg-slate-50 shadow-xl"
                        data-testid="cta-register-btn"
                        onClick={loginWithGoogle}
                    >
                        Crear cuenta gratis
                        <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white text-slate-500 py-16 px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Hexagon className="w-6 h-6 text-primary fill-primary/10" strokeWidth={2.5} />
                            <span className="text-lg font-bold text-slate-900">PriceHive</span>
                        </div>
                        <p className="max-w-xs text-sm leading-relaxed">
                            La plataforma líder en transparencia de precios para el consumidor moderno.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6">Producto</h4>
                        <ul className="space-y-4 font-medium text-sm">
                            <li className="hover:text-primary cursor-pointer transition-colors">Características</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Casos de Uso</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Seguridad</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6">Comunidad</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="hover:text-primary cursor-pointer transition-colors">Blog</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Guía del Usuario</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Soporte</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-medium text-slate-400">© 2024 PriceHive. Todos los derechos reservados.</p>
                    <div className="flex gap-8 text-sm font-medium">
                        <span className="hover:text-primary cursor-pointer transition-colors">Privacidad</span>
                        <span className="hover:text-primary cursor-pointer transition-colors">Términos</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
