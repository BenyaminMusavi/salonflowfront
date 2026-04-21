import * as React from "react";

type Variant = "primary" | "outline" | "ghost";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm font-medium h-11 px-5 transition-all duration-200";

  const styles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    outline:
      "border border-blue-200 text-blue-600 hover:bg-blue-50",
    ghost:
      "text-blue-600 hover:bg-blue-50",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    />
  );
}