import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { Hexagon, ArrowLeft, Sparkles } from "lucide-react";

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
            toast.success("¡Bienvenido al enjambre!");
            navigate("/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Error al crear cuenta");
        } finally {
            setLoading(false);
        }
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
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-extrabold text-secondary tracking-tight font-heading">
                            Crear Cuenta
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-medium mt-2">
                            Únete hoy y empieza a ahorrar con la red.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-secondary font-bold">Nombre Completo</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="h-14 bg-stone-50 border-border/60 focus:border-primary rounded-xl font-medium"
                                    data-testid="register-name-input"
                                />
                            </div>
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
                                    data-testid="register-email-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" title="password label" className="text-secondary font-bold">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-14 bg-stone-50 border-border/60 focus:border-primary rounded-xl font-medium"
                                    data-testid="register-password-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl font-bold btn-lift shadow-xl shadow-primary/20 text-lg"
                                data-testid="register-submit-btn"
                            >
                                {loading ? "Creando perfil..." : "Unirse al Enjambre"}
                            </Button>
                        </form>
                        <div className="mt-8 text-center">
                            <p className="text-muted-foreground font-medium">
                                ¿Ya eres del enjambre?{" "}
                                <Link to="/login" className="text-primary hover:text-primary/80 font-bold underline-offset-4 hover:underline">
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
