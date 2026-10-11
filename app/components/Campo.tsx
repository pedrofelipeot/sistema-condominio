"use client";

import { useState } from "react";

type Props = {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  icon?: React.ReactNode; // ícone opcional à esquerda do campo
};

export default function Campo({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
}: Props) {
  // Estado local: só o Campo precisa saber se a senha está visível
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500"
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={`min-h-14 w-full rounded-xl border border-slate-500 bg-slate-50 py-3 text-lg text-slate-900 placeholder:text-slate-500 transition-colors hover:border-slate-600 focus-visible:border-blue-700 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-700/25 ${
            icon ? "pl-12" : "pl-4"
          } ${isPassword ? "pr-28" : "pr-4"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((atual) => !atual)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-3 my-auto min-h-11 rounded-md px-2 text-base font-semibold text-blue-800 hover:text-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>
    </div>
  );
}