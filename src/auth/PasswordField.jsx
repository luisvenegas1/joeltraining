import { useState } from "react";

// Campo de contraseña con botón mostrar/ocultar (👁 / 🙈). Usa las clases
// globales .pw-wrap / .pw-eye / .inp (mismas que PasswordInput de la app), así
// que se ve igual en login, reset y perfil.
export function PasswordField({ value, onChange, placeholder = "••••••••", autoComplete = "current-password" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        className="inp"
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button type="button" className="pw-eye" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}
