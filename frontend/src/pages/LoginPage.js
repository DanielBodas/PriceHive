import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { Tag, ArrowLeft } from "lucide-react";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success("¡Bienvenido de vuelta!");
            navigate("/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio
                </Link>
                
                <Card className="border-slate-200 shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                            <Tag className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            Iniciar Sesión
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Accede a tu cuenta de PriceHive
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    data-testid="login-email-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    data-testid="login-password-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold btn-lift"
                                data-testid="login-submit-btn"
                            >
                                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                            </Button>
                        </form>
                        <div className="mt-6 text-center">
                            <p className="text-slate-600">
                                ¿No tienes cuenta?{" "}
                                <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                    Regístrate
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
