import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Loader2, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
    c.filter(Boolean).join(" ");

/* --- Button --- */
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    icon?: ReactNode;
};

export function Button({
    variant = "primary",
    size = "md",
    loading,
    icon,
    className,
    children,
    disabled,
    ...rest
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed";
    const variants: Record<ButtonVariant, string> = {
        primary: "bg-teal text-white hover:bg-teal-600 focus:ring-teal",
        secondary: "bg-white text-navy border border-slate-300 hover:bg-slate-50 focus:ring-navy",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        ghost: "text-navy hover:bg-slate-100 focus:ring-slate-300",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
    };
    return (
        <button
            className={cx(base, variants[variant], sizes[size], className)}
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
            {children}
        </button>
    );
}

/* --- Input / Textarea / Select --- */
export function Field({
    label, htmlFor, hint, error, children,
}: { label: string; htmlFor?: string; hint?: string; error?: string; children: ReactNode }) {
    return (
        <div className="space-y-1">
            <label htmlFor={htmlFor} className="block text-sm font-medium text-navy">
                {label}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    const { className, ...rest } = props;
    return (
        <input
            className={cx(
                "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30",
                className
            )}
            {...rest}
        />
    );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const { className, ...rest } = props;
    return (
        <textarea
            className={cx(
                "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30",
                className
            )}
            {...rest}
        />
    );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
    const { className, children, ...rest } = props;
    return (
        <select
            className={cx(
                "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30",
                className
            )}
            {...rest}
        >
            {children}
        </select>
    );
}

/* --- Card --- */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cx("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
            {children}
        </div>
    );
}

/* --- Badge --- */
type BadgeColor = "gray" | "blue" | "green" | "yellow" | "red" | "teal";
export function Badge({ children, color = "gray" }: { children: ReactNode; color?: BadgeColor }) {
    const colors: Record<BadgeColor, string> = {
        gray: "bg-slate-100 text-slate-700",
        blue: "bg-blue-100 text-blue-800",
        green: "bg-emerald-100 text-emerald-800",
        yellow: "bg-amber-100 text-amber-800",
        red: "bg-red-100 text-red-800",
        teal: "bg-teal-50 text-teal-700",
    };
    return (
        <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", colors[color])}>
            {children}
        </span>
    );
}

/* --- Spinner --- */
export function Spinner({ label }: { label?: string }) {
    return (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            {label && <span className="text-sm">{label}</span>}
        </div>
    );
}

/* --- Empty state --- */
export function EmptyState({
    icon, title, description, action,
}: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            {icon && <div className="mb-3 text-slate-400">{icon}</div>}
            <h3 className="text-base font-semibold text-navy">{title}</h3>
            {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

/* --- Modal --- */
export function Modal({
    open, onClose, title, children, footer,
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                    <h2 className="text-lg font-semibold text-navy">{title}</h2>
                    <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="px-5 py-4">{children}</div>
                {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
            </div>
        </div>
    );
}

/* --- Alert --- */
export function Alert({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: ReactNode }) {
    const styles = {
        info: "bg-blue-50 text-blue-800 border-blue-200",
        error: "bg-red-50 text-red-800 border-red-200",
        success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
    return <div className={cx("rounded-lg border px-3 py-2 text-sm", styles[kind])}>{children}</div>;
}

/* --- Page header --- */
export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-navy">{title}</h1>
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {action}
        </div>
    );
}