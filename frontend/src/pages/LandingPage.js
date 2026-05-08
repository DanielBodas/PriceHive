import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
    TrendingDown,
    Tag,
    Sparkles,
    Users,
    Flame,
    Shield,
    ShoppingCart,
    Trophy,
    MessageCircle,
    Heart,
    ThumbsUp,
    CheckCircle2,
    ArrowRight,
    Zap,
    Activity,
    Store,
    ArrowDown,
    Lightbulb,
    AlertTriangle,
    Crown,
    ChevronRight,
} from "lucide-react";

/* ──────────────────────────────────────────────
   Mock data (visual-only, no backend dependency)
   ────────────────────────────────────────────── */

const mockPosts = [
    {
        id: 1,
        user: "María G.",
        color: "bg-rose-100 text-rose-700",
        time: "hace 5m",
        type: "Alerta",
        typeColor: "bg-rose-50 text-rose-600",
        typeIcon: AlertTriangle,
        content: "¡Ojo! Leche Hacendado sube de 0,85€ a 1,05€ en Mercadona esta semana. +23% sin aviso.",
        likes: 42,
        comments: 8,
    },
    {
        id: 2,
        user: "Carlos R.",
        color: "bg-emerald-100 text-emerald-700",
        time: "hace 1h",
        type: "Consejo",
        typeColor: "bg-emerald-50 text-emerald-600",
        typeIcon: Lightbulb,
        content: "Tip: Las ofertas del Carrefour los miércoles suelen ser más baratas que las del finde. Comprado y comprobado 💪",
        likes: 89,
        comments: 14,
    },
    {
        id: 3,
        user: "Laura M.",
        color: "bg-sky-100 text-sky-700",
        time: "hace 3h",
        type: "General",
        typeColor: "bg-slate-100 text-slate-600",
        typeIcon: MessageCircle,
        content: "Yogures Danone en oferta en Lidl a 1,99€/pack. Registrado en la app, ¡gracias comunidad! 🎉",
        likes: 127,
        comments: 22,
    },
];

const mockTrending = [
    { name: "Aceite de oliva 1L", store: "Mercadona", price: "4,25€", delta: "-12%", up: false },
    { name: "Leche entera 1L", store: "Lidl", price: "0,89€", delta: "+3%", up: true },
    { name: "Huevos docena", store: "Carrefour", price: "2,15€", delta: "-7%", up: false },
    { name: "Pan de molde", store: "Aldi", price: "1,45€", delta: "-15%", up: false },
];

const mockLeaderboard = [
    { name: "María G.", pts: 3450, medal: "🥇" },
    { name: "Carlos R.", pts: 2890, medal: "🥈" },
    { name: "Laura M.", pts: 2315, medal: "🥉" },
];

/* ──────────────────────────────────────────────
   Small UI pieces
   ────────────────────────────────────────────── */

const FeatureCard = ({ icon: Icon, title, desc, accent }) => (
    <div className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
        <div className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
);

const StatPill = ({ value, label, color = "text-emerald-500" }) => (
    <div className="text-center">
        <p className={`text-3xl md:text-4xl font-extrabold ${color} tabular-nums`}>{value}</p>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

/* ──────────────────────────────────────────────
   Main
   ────────────────────────────────────────────── */

const LandingPage = () => {
    const { loginWithGoogle } = useAuth();

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* ── NAV ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Tag className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                            PriceHive
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#comunidad" className="hover:text-slate-900 transition-colors">Comunidad</a>
                        <a href="#features" className="hover:text-slate-900 transition-colors">Herramientas</a>
                        <a href="#ranking" className="hover:text-slate-900 transition-colors">Ranking</a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/login">
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 rounded-full" data-testid="login-nav-btn">
                                Iniciar Sesión
                            </Button>
                        </Link>
                        <Button
                            onClick={loginWithGoogle}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 font-bold shadow-lg"
                            data-testid="register-nav-btn"
                        >
                            Empezar
                        </Button>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="pt-32 pb-16 px-6 relative">
                {/* Decorative blobs */}
                <div className="absolute top-40 left-10 w-64 h-64 rounded-full bg-emerald-300/20 blur-3xl -z-10" />
                <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-teal-400/15 blur-3xl -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-10 items-center">
                        {/* Copy */}
                        <div className="lg:col-span-7 space-y-7">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                                <Sparkles className="w-3.5 h-3.5" />
                                La red social de compradores inteligentes
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tighter">
                                No más{" "}
                                <span className="relative inline-block">
                                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">falsas ofertas</span>
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                        <path d="M2 9C75 3 150 3 298 9" stroke="url(#g)" strokeWidth="3" strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="g" x1="0" x2="300" y1="0" y2="0">
                                                <stop stopColor="#10b981" />
                                                <stop offset="1" stopColor="#14b8a6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                                Una comunidad que comparte precios reales en tiempo real. Comparte hallazgos, detecta subidas disfrazadas y ahorra en cada compra.
                            </p>
                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full px-7 py-6 text-base font-bold shadow-xl shadow-emerald-500/30"
                                    data-testid="hero-cta-btn"
                                    onClick={loginWithGoogle}
                                >
                                    Unirme a la comunidad
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                <Link to="/login">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="rounded-full px-7 py-6 text-base border-slate-300 font-semibold"
                                        data-testid="hero-login-btn"
                                    >
                                        Ya tengo cuenta
                                    </Button>
                                </Link>
                            </div>
                            {/* Social proof */}
                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex -space-x-3">
                                    {["bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-sky-400", "bg-violet-400"].map((c, i) => (
                                        <div key={i} className={`w-9 h-9 rounded-full ${c} ring-3 ring-white border-2 border-white`} />
                                    ))}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">+2.500 compradores inteligentes</p>
                                    <p className="text-xs text-slate-500">comparten precios cada día</p>
                                </div>
                            </div>
                        </div>

                        {/* Mock feed card */}
                        <div className="lg:col-span-5 relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/30 to-teal-600/30 blur-2xl rounded-3xl -z-10" />
                            <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl p-5 space-y-3 rotate-1 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Feed en vivo</span>
                                    </div>
                                    <Flame className="w-4 h-4 text-orange-500" />
                                </div>
                                {mockPosts.map((p) => {
                                    const TIcon = p.typeIcon;
                                    return (
                                        <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${p.color}`}>
                                                    {p.user[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="font-bold text-slate-900">{p.user}</span>
                                                            <span className="text-slate-400">{p.time}</span>
                                                        </div>
                                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${p.typeColor}`}>
                                                            <TIcon className="w-2.5 h-2.5" />
                                                            {p.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] text-slate-700 mt-1 leading-snug line-clamp-2">{p.content}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                                                        <div className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {p.likes}</div>
                                                        <div className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-sky-500" /> {p.comments}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-100">
                        <StatPill value="+2.500" label="Usuarios activos" />
                        <StatPill value="+15k" label="Precios registrados" color="text-sky-500" />
                        <StatPill value="-23%" label="Ahorro promedio" color="text-rose-500" />
                        <StatPill value="4" label="Supermercados" color="text-amber-500" />
                    </div>
                </div>
            </section>

            {/* ── COMUNIDAD (3-col preview) ── */}
            <section id="comunidad" className="py-24 px-6 bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-4">
                            <Users className="w-3.5 h-3.5" />
                            Una comunidad viva
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                            Hallazgos reales, compradores reales
                        </h2>
                        <p className="text-lg text-slate-600">
                            Cada día miles de usuarios comparten precios, alertas y consejos. Así es como se ve por dentro.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {/* Trending */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">Tendencias</h3>
                            </div>
                            <div className="space-y-3">
                                {mockTrending.map((t, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{t.name}</p>
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                <Store className="w-3 h-3" /> {t.store}
                                                <span className="text-slate-300">·</span>
                                                <span className="font-bold text-slate-900">{t.price}</span>
                                                <span className={`font-bold ${t.up ? "text-rose-500" : "text-emerald-500"}`}>
                                                    {t.delta}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Best deals */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-xl shadow-emerald-500/20">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <TrendingDown className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold">Mejores ofertas</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { name: "Pan de molde", store: "Aldi", price: "1,45€", delta: "-15%" },
                                    { name: "Aceite 1L", store: "Mercadona", price: "4,25€", delta: "-12%" },
                                    { name: "Huevos docena", store: "Carrefour", price: "2,15€", delta: "-7%" },
                                ].map((d, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <ArrowDown className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{d.name}</p>
                                            <p className="text-[11px] text-emerald-100 truncate">{d.store}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-extrabold tabular-nums">{d.price}</p>
                                            <p className="text-[10px] font-bold text-emerald-100">{d.delta}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div id="ranking" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <Crown className="w-4 h-4 text-amber-500" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">Top contribuidores</h3>
                            </div>
                            <div className="space-y-3">
                                {mockLeaderboard.map((u, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-xl">{u.medal}</span>
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-700" : "bg-orange-100 text-orange-700"}`}>
                                            {u.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                                <Trophy className="w-3 h-3" />
                                                {u.pts} puntos
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-500 mb-2">Gana puntos compartiendo hallazgos</p>
                                <button onClick={loginWithGoogle} className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1">
                                    Entrar al ranking
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                            Herramientas que te hacen ahorrar
                        </h2>
                        <p className="text-lg text-slate-600">
                            Todo lo que necesitas para comprar de forma más inteligente.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <FeatureCard icon={Activity} title="Precios en tiempo real" desc="Actualizados por la comunidad cada día, sin retrasos." accent="bg-emerald-50 text-emerald-600" />
                        <FeatureCard icon={ShoppingCart} title="Lista inteligente" desc="Calcula el total de tu compra antes de ir a la tienda." accent="bg-sky-50 text-sky-600" />
                        <FeatureCard icon={Shield} title="Detecta estafas" desc="Alertas automáticas cuando un precio sube sin aviso." accent="bg-rose-50 text-rose-600" />
                        <FeatureCard icon={Trophy} title="Gamificación" desc="Gana puntos, sube de nivel y compite en el ranking." accent="bg-amber-50 text-amber-600" />
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                            Así de simple
                        </h2>
                        <p className="text-lg text-slate-600">Tres pasos. Cero complicaciones.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { n: "01", icon: Zap, title: "Únete gratis", desc: "Regístrate con Google en 2 segundos." },
                            { n: "02", icon: Tag, title: "Comparte precios", desc: "Registra un precio y gana +10 puntos." },
                            { n: "03", icon: TrendingDown, title: "Ahorra cada día", desc: "Compara, planifica y ahorra hasta un 23%." },
                        ].map((s, i) => (
                            <div key={i} className="relative bg-white rounded-2xl p-7 border border-slate-100 hover:shadow-lg transition-all">
                                <div className="absolute top-5 right-5 text-5xl font-extrabold text-slate-100">{s.n}</div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                                    <s.icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-12 md:p-16 shadow-2xl shadow-emerald-500/30">
                        {/* Decorative */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

                        <div className="relative z-10 text-center max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-bold mb-6">
                                <Sparkles className="w-3.5 h-3.5" />
                                Gratis para siempre
                            </div>
                            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-5 tracking-tight leading-[1.1]">
                                Empieza a ahorrar hoy
                            </h2>
                            <p className="text-lg md:text-xl text-emerald-50 mb-8">
                                Únete a miles de compradores que ya protegen su bolsillo.
                            </p>
                            <Button
                                size="lg"
                                className="bg-white text-emerald-700 hover:bg-slate-100 rounded-full px-8 py-6 text-base font-bold shadow-xl"
                                data-testid="cta-register-btn"
                                onClick={loginWithGoogle}
                            >
                                Empezar con Google
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <p className="mt-4 text-xs text-emerald-100">Sin tarjeta. Sin compromiso. Solo ahorro.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <Tag className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-bold">PriceHive</span>
                        </div>
                        <p className="text-xs">La red social de compradores inteligentes · © 2026</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
