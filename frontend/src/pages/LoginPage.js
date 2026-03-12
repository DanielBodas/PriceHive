import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { Hexagon, ArrowLeft, Globe } from "lucide-react";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success("¡Bienvenido de vuelta!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error capturado:", error);
            if (error.response) {
                toast.error(error.response.data?.detail || "Error en los datos");
            } else if (error.request) {
                toast.error("Error de conexión con el servidor.");
            } else {
                toast.error("Error: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        loginWithGoogle();
    };

    return (
        <div className="min-h-screen bg-background hive-pattern flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md animate-fade-in-up">
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors font-bold group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Volver al inicio
                </Link>

                <Card className="border-border/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="h-2 bg-primary" />
                    <CardHeader className="text-center pt-10 pb-2">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <Hexagon className="w-20 h-20 text-primary fill-primary/10" strokeWidth={1.5} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Globe className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-extrabold text-secondary tracking-tight font-heading">
                            Bienvenido al Enjambre
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-medium mt-2">
                            La inteligencia colectiva de precios te espera.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-6">
                        <Button
                            variant="outline"
                            className="w-full h-14 gap-3 mb-8 border-border hover:bg-primary/5 hover:border-primary/30 rounded-2xl font-bold transition-all"
                            onClick={handleGoogleLogin}
                            data-testid="google-login-btn"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar con Google
                        </Button>

                        <div className="relative mb-8">
                            <Separator />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-white px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">O usa tu email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-secondary font-bold">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-14 bg-stone-50 border-border/60 focus:border-primary rounded-xl font-medium"
                                    data-testid="login-email-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-secondary font-bold">Contraseña</Label>
                                    <span className="text-xs font-bold text-primary hover:underline cursor-pointer">¿Olvidaste tu contraseña?</span>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-14 bg-stone-50 border-border/60 focus:border-primary rounded-xl font-medium"
                                    data-testid="login-password-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl font-bold btn-lift shadow-xl shadow-primary/20 text-lg"
                                data-testid="login-submit-btn"
                            >
                                {loading ? "Conectando..." : "Entrar al Enjambre"}
                            </Button>
                        </form>
                        <div className="mt-8 text-center">
                            <p className="text-muted-foreground font-medium">
                                ¿Nuevo por aquí?{" "}
                                <Link to="/register" className="text-primary hover:text-primary/80 font-bold underline-offset-4 hover:underline">
                                    Regístrate gratis
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
