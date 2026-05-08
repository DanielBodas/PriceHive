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
                <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-primary mb-8 transition-colors font-bold text-sm uppercase tracking-wider">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio
                </Link>
                
                <Card className="border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="text-center pb-2 pt-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                            <Tag className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-3xl font-black text-slate-900 font-heading tracking-tight">
                            Únete a la colmena
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium mt-2">
                            Empieza a ahorrar con la comunidad PriceHive
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
                                className="w-full h-12 rounded-xl font-bold"
                                data-testid="register-submit-btn"
                            >
                                {loading ? "Creando cuenta..." : "Crear Cuenta"}
                            </Button>
                        </form>
                        <div className="mt-8 text-center pb-6">
                            <p className="text-slate-500 text-sm font-medium">
                                ¿Ya tienes cuenta?{" "}
                                <Link to="/login" className="text-primary hover:underline font-bold">
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
