import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { ShoppingCart, TrendingDown, Users, BarChart3, Shield, Tag, ArrowRight, Star } from "lucide-react";

const LandingPage = () => {
    const { loginWithGoogle } = useAuth();

    const features = [
        {
            icon: <Users className="w-6 h-6" />,
            title: "Comunidad Colaborativa",
            description: "Miles de usuarios compartiendo precios reales de supermercados en tiempo real."
        },
        {
            icon: <TrendingDown className="w-6 h-6" />,
            title: "Ahorra Dinero",
            description: "Compara precios entre supermercados y encuentra las mejores ofertas reales."
        },
        {
            icon: <ShoppingCart className="w-6 h-6" />,
            title: "Lista de Compra Inteligente",
            description: "Planifica tu compra y estima el coste antes de ir al supermercado."
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Análisis de Precios",
            description: "Visualiza la evolución de precios y detecta falsas ofertas."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 px-4">
                <div className="max-w-7xl mx-auto py-3 md:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-500 flex items-center justify-center">
                            <Tag className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <span className="text-lg md:text-xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            PriceHive
                        </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link to="/login">
                            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-emerald-600 px-2 md:px-4" data-testid="login-nav-btn">
                                <span className="hidden xs:inline">Iniciar Sesión</span>
                                <span className="xs:hidden">Login</span>
                            </Button>
                        </Link>
                        <Button 
                            onClick={loginWithGoogle}
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4 md:px-6 btn-lift"
                            data-testid="register-nav-btn"
                        >
                            <span className="hidden xs:inline">Empezar con Google</span>
                            <span className="xs:hidden">Empezar</span>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-gradient pt-24 md:pt-32 pb-16 md:pb-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <Shield className="w-4 h-4" />
                                Protege tu bolsillo
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                No más{" "}
                                <span className="text-emerald-500">falsas ofertas</span>
                            </h1>
                            <p className="text-base lg:text-lg text-slate-600 mb-8 max-w-lg">
                                Compara precios reales de supermercados gracias a nuestra comunidad. 
                                Detecta subidas de precios encubiertas y ahorra en cada compra.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    size="lg" 
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 py-4 md:py-6 text-base md:text-lg font-semibold btn-lift shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
                                    data-testid="hero-cta-btn"
                                    onClick={loginWithGoogle}
                                >
                                    Empezar con Google
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Link to="/login" className="w-full sm:w-auto">
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        className="rounded-full px-8 py-4 md:py-6 text-base md:text-lg border-slate-300 hover:bg-slate-100 w-full"
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
                            <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-white rounded-xl p-3 md:p-4 shadow-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <TrendingDown className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Ahorro medio</p>
                                        <p className="text-2xl font-bold text-slate-900 font-mono">-23%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            Todo lo que necesitas para comprar inteligente
                        </h2>
                        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
                            Herramientas colaborativas para que nunca más pagues de más
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className={`bg-slate-50 rounded-2xl p-8 border border-slate-100 card-interactive animate-fade-in-up animate-delay-${(index + 1) * 100}`}
                                data-testid={`feature-card-${index}`}
                            >
                                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-16 md:py-24 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            Cómo funciona
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-8">
                        {[
                            { step: "01", title: "Crea tu lista", desc: "Añade los productos que necesitas comprar" },
                            { step: "02", title: "Compra y registra", desc: "Anota los precios que encuentras en el super" },
                            { step: "03", title: "Comparte y ahorra", desc: "Tu info ayuda a otros y ves las mejores ofertas" }
                        ].map((item, index) => (
                            <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                                <div className="text-5xl md:text-6xl font-bold text-emerald-200 mb-2 md:mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    {item.step}
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    {item.title}
                                </h3>
                                <p className="text-sm md:text-base text-slate-600 px-4 md:px-0">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 px-6 bg-emerald-500">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Únete a la comunidad PriceHive
                    </h2>
                    <p className="text-emerald-100 text-base md:text-lg mb-8 max-w-2xl mx-auto">
                        Más de 10.000 usuarios ya están ahorrando en sus compras semanales
                    </p>
                    <Button 
                        size="lg" 
                        className="bg-white text-emerald-600 hover:bg-slate-100 rounded-full px-8 md:px-10 py-4 md:py-6 text-base md:text-lg font-semibold shadow-xl w-full sm:w-auto"
                        data-testid="cta-register-btn"
                        onClick={loginWithGoogle}
                    >
                        Empezar con Google
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold">PriceHive</span>
                    </div>
                    <p className="text-sm">© 2024 PriceHive. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
