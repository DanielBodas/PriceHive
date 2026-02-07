import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { Tag, ArrowLeft } from "lucide-react";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        setLoading(true);
        try {
            await register(name, email, password);
            toast.success("¡Cuenta creada con éxito!");
            navigate("/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Error al crear cuenta");
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
                            Crear Cuenta
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Únete a la comunidad PriceHive
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700">Nombre</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="h-12 bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    data-testid="register-name-input"
                                />
                            </div>
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
                                    data-testid="register-email-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    data-testid="register-password-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold btn-lift"
                                data-testid="register-submit-btn"
                            >
                                {loading ? "Creando cuenta..." : "Crear Cuenta"}
                            </Button>
                        </form>
                        <div className="mt-6 text-center">
                            <p className="text-slate-600">
                                ¿Ya tienes cuenta?{" "}
                                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
