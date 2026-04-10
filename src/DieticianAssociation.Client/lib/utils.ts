import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const truncateUrl = (url: string, length = 40) => {
  return url.length > length ? `${url.slice(0, length)}...` : url;
}
