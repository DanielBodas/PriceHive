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
        <div className="min-h-screen bg-stone-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary border-b-4 border-primary">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 group">
                        <Hexagon className="w-10 h-10 text-primary fill-primary/10 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                        <span className="text-2xl font-extrabold tracking-tight text-white font-heading uppercase tracking-widest">
                            Enjambre
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-stone-300 hover:text-primary hover:bg-white/5 font-semibold" data-testid="login-nav-btn">
                                Iniciar Sesión
                            </Button>
                        </Link>
                        <Button 
                            onClick={loginWithGoogle}
                            className="rounded-full px-6 font-bold shadow-lg"
                            data-testid="register-nav-btn"
                        >
                            Empezar con Google
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-white bee-stripe-bottom">
                <div className="max-w-7xl mx-auto rounded-[2rem] p-8 lg:p-16 border border-stone-200 relative bg-stone-50/50">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-full text-sm font-bold mb-6 border border-primary/20">
                                <Sparkles className="w-4 h-4" />
                                Inteligencia Colectiva de Precios
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-secondary leading-[1.1] mb-6 tracking-tight font-heading">
                                Construye la mejor <span className="text-primary">colmena</span> de precios
                            </h1>
                            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed font-medium">
                                No más falsas ofertas. Únete a miles de usuarios que colaboran para transparentar los precios de los supermercados.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button 
                                    size="lg" 
                                    className="rounded-full px-8 py-7 text-lg font-bold shadow-xl"
                                    data-testid="hero-cta-btn"
                                    onClick={loginWithGoogle}
                                >
                                    Unirse al Enjambre
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Link to="/login">
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        className="rounded-full px-8 py-6 text-lg border-stone-300 hover:bg-stone-100 text-secondary font-bold"
                                        data-testid="hero-login-btn"
                                    >
                                        Ya tengo cuenta
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
            <section className="py-24 px-6 bg-stone-50 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-secondary mb-4 tracking-tight font-heading">
                            Poder compartido, ahorro multiplicado
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
                            Enjambre utiliza tecnología de red para que nunca más vuelvas a pagar de más por un producto básico.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className={`bg-white rounded-[2rem] p-8 border-2 border-stone-200 card-interactive group hover:border-primary transition-all duration-300 animate-fade-in-up shadow-sm`}
                                style={{ animationDelay: `${index * 100}ms` }}
                                data-testid={`feature-card-${index}`}
                            >
                                <div className="relative mb-6">
                                    <Hexagon className="w-14 h-14 text-primary fill-primary/10 transition-transform group-hover:rotate-12" strokeWidth={1.5} />
                                    <div className="absolute inset-0 flex items-center justify-center text-primary">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-3 font-heading">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 px-6 bg-white bee-stripe border-y-4 border-secondary">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-secondary mb-4 tracking-tight font-heading">
                            El Ciclo Enjambre
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px border-t border-dashed border-primary/30 -z-10" />

                        {[
                            { step: "01", title: "Planificación", desc: "Añade productos a tu lista inteligente y recibe estimaciones basadas en datos locales.", icon: <ShoppingCart className="w-5 h-5" /> },
                            { step: "02", title: "Colaboración", desc: "Registra precios durante tu compra. Cada dato fortalece la red de información.", icon: <Globe className="w-5 h-5" /> },
                            { step: "03", title: "Recompensa", desc: "Gana puntos, sube en la jerarquía del enjambre y ayuda a miles a ahorrar.", icon: <Sparkles className="w-5 h-5" /> }
                        ].map((item, index) => (
                            <div key={index} className="text-center animate-fade-in-up group" style={{ animationDelay: `${index * 150}ms` }}>
                                <div className="relative inline-block mb-6">
                                    <div className="w-24 h-24 rounded-[1.5rem] bg-stone-50 border-2 border-stone-200 shadow-sm flex items-center justify-center text-5xl font-black text-primary group-hover:scale-105 transition-all duration-300">
                                        {item.step}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center shadow-lg border border-primary">
                                        {item.icon}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-secondary mb-3 font-heading">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground font-semibold leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 relative overflow-hidden bg-secondary border-t-8 border-primary">
                <div className="absolute inset-0 bee-stripe opacity-5 -z-10" />

                <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
                    <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight font-heading">
                        ¿Listo para unirte al <span className="text-primary">enjambre</span>?
                    </h2>
                    <p className="text-stone-400 text-xl mb-10 max-w-2xl mx-auto font-bold uppercase tracking-wider">
                        Democratizando el acceso a la información de precios.
                    </p>
                    <Button 
                        size="lg" 
                        className="rounded-full px-12 py-8 text-xl font-bold shadow-2xl"
                        data-testid="cta-register-btn"
                        onClick={loginWithGoogle}
                    >
                        Empezar Ahora Gratis
                        <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-stone-50 text-muted-foreground py-16 px-6 border-t border-border">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Hexagon className="w-8 h-8 text-primary fill-primary/10" strokeWidth={2.5} />
                            <span className="text-xl font-extrabold text-secondary uppercase tracking-widest">Enjambre</span>
                        </div>
                        <p className="max-w-xs font-medium leading-relaxed">
                            La plataforma líder en inteligencia colectiva de precios. Empoderando al consumidor a través de la colaboración masiva.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-secondary font-bold mb-6">Producto</h4>
                        <ul className="space-y-4 font-medium text-sm">
                            <li className="hover:text-primary cursor-pointer transition-colors">Características</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Casos de Uso</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Seguridad</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-secondary font-bold mb-6">Comunidad</h4>
                        <ul className="space-y-4 font-medium text-sm">
                            <li className="hover:text-primary cursor-pointer transition-colors">Blog del Enjambre</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Guía del Usuario</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Soporte</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-medium">© 2024 Enjambre. Inteligencia Colectiva para el Ahorro Real.</p>
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
