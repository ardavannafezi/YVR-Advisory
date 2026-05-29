import { forwardRef } from "react";
import clsx from "clsx";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  error?: string;
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode;
}

export const FormField = forwardRef<any, FormFieldProps>(
  ({ label, error, as = "input", className, children, ...props }, ref) => {
    const base =
      "w-full bg-transparent border border-white/10 px-4 py-3 text-text-primary placeholder:text-text-dim focus:outline-none focus:border-gold transition-colors text-sm";
    const errorClass = error ? "border-red-500/60" : "";

    return (
      <div className={clsx("flex flex-col gap-1.5", className)}>
        <label className="text-[10px] uppercase tracking-widest text-text-muted">{label}</label>
        {as === "textarea" ? (
          <textarea ref={ref} className={clsx(base, errorClass, "resize-none h-28")} {...(props as any)} />
        ) : as === "select" ? (
          <select ref={ref} className={clsx(base, errorClass, "bg-background")} {...(props as any)}>
            {children}
          </select>
        ) : (
          <input ref={ref} className={clsx(base, errorClass)} {...(props as any)} />
        )}
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";
