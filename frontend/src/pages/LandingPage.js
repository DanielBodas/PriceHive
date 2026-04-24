import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { TrendingDown, Tag } from "lucide-react";
import { useParallax } from "../hooks/useParallax";
import ScrollIndicator from "../components/ScrollIndicator";

const LandingPage = () => {
    const { loginWithGoogle } = useAuth();
    const heroParallax = useParallax(0.5);
    const section2Parallax = useParallax(0.4);

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            <ScrollIndicator />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <Tag className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            PriceHive
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900" data-testid="login-nav-btn">
                                Iniciar Sesión
                            </Button>
                        </Link>
                        <Button 
                            onClick={loginWithGoogle}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 font-medium" 
                            data-testid="register-nav-btn"
                        >
                            Empezar
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-40 pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            No más<br />
                            <span className="text-emerald-500">falsas ofertas</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Compara precios reales en tiempo real. Ahorra dinero en cada compra.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button 
                                size="lg" 
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 py-6 text-base font-semibold"
                                data-testid="hero-cta-btn"
                                onClick={loginWithGoogle}
                            >
                                Empezar con Google
                            </Button>
                            <Link to="/login">
                                <Button 
                                    variant="outline" 
                                    size="lg" 
                                    className="rounded-full px-8 py-6 text-base border-slate-300 hover:bg-slate-50"
                                    data-testid="hero-login-btn"
                                >
                                    Ya tengo cuenta
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hero Image with Parallax */}
            <section className="px-6 pb-40">
                <div className="max-w-6xl mx-auto">
                    <div 
                        ref={heroParallax.elementRef}
                        className="overflow-hidden rounded-3xl h-96 lg:h-screen shadow-2xl"
                        style={{
                            transform: `translateY(${heroParallax.scrollY * 0.3}px)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1601599963565-b7ba29c8e3ff?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200" 
                            alt="Supermercado"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-32 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-5xl font-bold text-slate-900 mb-20 text-center" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Herramientas inteligentes
                    </h2>
                    <div className="grid md:grid-cols-2 gap-16 lg:gap-20">
                        {[
                            { title: "Comparador de Precios", desc: "Acceso a precios reales de supermercados actualizados en tiempo real." },
                            { title: "Listas Inteligentes", desc: "Planifica tu compra y estima el coste total antes de ir." },
                            { title: "Análisis Profundo", desc: "Detecta patrones de precios y falsas ofertas automáticamente." },
                            { title: "Comunidad", desc: "Comparte datos con miles de usuarios y recibe recomendaciones." }
                        ].map((feature, idx) => (
                            <div key={idx} className="pb-8 border-b border-slate-200">
                                <h3 className="text-2xl font-semibold text-slate-900 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-slate-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 2 with Parallax */}
            <section className="px-6 py-40">
                <div className="max-w-6xl mx-auto" ref={section2Parallax.elementRef}>
                    <div className="grid md:grid-cols-2 gap-16 lg:gap-20 items-center">
                        <div>
                            <h2 className="text-5xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                Ahorra en cada compra
                            </h2>
                            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                                Con PriceHive, el usuario promedio ahorra un 23% en sus compras semanales.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <TrendingDown className="w-7 h-7 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Ahorro promedio</p>
                                    <p className="text-3xl font-bold text-slate-900 font-mono">-23%</p>
                                </div>
                            </div>
                        </div>
                        <div 
                            className="overflow-hidden rounded-3xl h-96 lg:h-full shadow-2xl"
                            style={{
                                transform: `translateY(${section2Parallax.scrollY * 0.2}px)`,
                                transition: 'transform 0.1s ease-out',
                                minHeight: '500px'
                            }}
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?crop=entropy&cs=srgb&fm=jpg&q=85&w=600" 
                                alt="App"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 px-6 bg-gradient-to-br from-emerald-500 to-teal-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Empieza a ahorrar
                    </h2>
                    <p className="text-xl text-emerald-100 mb-10">
                        Únete a miles de usuarios que ya protegen su bolsillo
                    </p>
                    <Button 
                        size="lg" 
                        className="bg-white text-emerald-600 hover:bg-slate-100 rounded-full px-10 py-7 text-lg font-semibold shadow-xl"
                        data-testid="cta-register-btn"
                        onClick={loginWithGoogle}
                    >
                        Empezar ahora
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <Tag className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-semibold">PriceHive</span>
                        </div>
                        <p className="text-sm">© 2026 PriceHive</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
