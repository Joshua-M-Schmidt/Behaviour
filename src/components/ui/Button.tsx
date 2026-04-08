"use client";

import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-[var(--accent)] text-[var(--color-midnight)] hover:opacity-90",
    secondary:
      "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:opacity-80",
    danger: "bg-[var(--error)] text-white hover:opacity-90",
    ghost:
      "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
