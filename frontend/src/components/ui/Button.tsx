import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success" | "gradient";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: `
    bg-indigo-600 text-white shadow-md hover:shadow-lg
    hover:bg-indigo-500 active:bg-indigo-700
    dark:bg-indigo-600 dark:hover:bg-indigo-500
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    dark:focus:ring-offset-slate-900
    hover-lift
  `,
  secondary: `
    bg-white text-slate-700 border border-slate-200 shadow-sm
    hover:bg-slate-50 hover:border-slate-300 hover:shadow-md
    dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700
    dark:hover:bg-slate-700 dark:hover:border-slate-600
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    dark:focus:ring-offset-slate-900
  `,
  danger: `
    bg-red-50 text-red-600 border border-red-200 shadow-sm
    hover:bg-red-100 hover:border-red-300 hover:shadow-md
    dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/60
    dark:hover:bg-red-950/50 dark:hover:border-red-800
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    dark:focus:ring-offset-slate-900
  `,
  success: `
    bg-green-600 text-white shadow-md hover:shadow-lg
    hover:bg-green-500 active:bg-green-700
    dark:bg-green-600 dark:hover:bg-green-500
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
    dark:focus:ring-offset-slate-900
    hover-lift
  `,
  gradient: `
    bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg
    hover:shadow-xl hover:from-indigo-500 hover:to-purple-500
    active:from-indigo-700 active:to-purple-700
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    dark:focus:ring-offset-slate-900
    hover-lift
  `,
  ghost: `
    text-slate-600 hover:bg-slate-100 hover:text-slate-900
    dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    dark:focus:ring-offset-slate-900
  `,
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs font-medium",
  md: "px-4 py-2 text-sm font-medium",
  lg: "px-6 py-3 text-base font-semibold",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg
        transition-all duration-200 ease-out
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    />
  );
}
