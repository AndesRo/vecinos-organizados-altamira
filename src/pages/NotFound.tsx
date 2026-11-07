import { Link } from "react-router-dom";
import { Button, Card } from "../components/ui";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="max-w-md p-8 text-center">
                <h1 className="text-2xl font-bold text-navy">Página no encontrada</h1>
                <p className="mt-2 text-sm text-slate-500">La ruta que buscas no existe.</p>
                <div className="mt-6"><Link to="/"><Button>Ir al inicio</Button></Link></div>
            </Card>
        </div>
    );
}