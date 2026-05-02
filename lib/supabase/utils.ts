import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AQUÍ PONES TU CORREO PARA VER EL BONO
export function isAdmin(email: string | undefined | null) {
  const adminEmail = 'tu-correo@gmail.com' // <-- CAMBIA ESTO POR TU CORREO
  return email === adminEmail
}
