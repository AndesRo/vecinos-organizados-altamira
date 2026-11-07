import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar desktop */}
            <aside className="hidden lg:block">
                <Sidebar />
            </aside>

            {/* Sidebar mobile */}
            {open && (
                <div className="fixed inset-0 z-40 flex lg:hidden">
                    <div className="relative">
                        <Sidebar onNavigate={() => setOpen(false)} />
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute -right-10 top-3 rounded-md bg-white p-1 shadow"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
                </div>
            )}

            <div className="flex flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
                    <button onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-slate-100">
                        <Menu className="h-5 w-5" />
                    </button>
                    <p className="font-semibold text-navy">Vecinos Altamira</p>
                    <span className="w-9" />
                </header>
                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
                    <div className="mx-auto w-full max-w-6xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}