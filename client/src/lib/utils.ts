import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'BRL', locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatDate(date: Date | string, locale = 'pt-BR'): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

export function calculateSubtotal(quantity: number, unitPrice: number, discount = 0): number {
  return quantity * unitPrice * (1 - discount / 100);
}

export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

export function calculateTotal(items: Array<{ subtotal: number }>, taxRate = 0): number {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = calculateTaxAmount(subtotal, taxRate);
  return subtotal + taxAmount;
}

export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

/**
 * Obtém as iniciais de um nome
 * @param name Nome completo
 * @returns Iniciais (máximo 2 caracteres)
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') return '?';
  
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

export function getStatusColor(status: string): "default" | "destructive" | "outline" | "secondary" | "rascunho" | "pendente" | "analise" | "aprovado" | "recusado" {
  switch (status) {
    case 'aprovado':
      return 'aprovado';
    case 'pendente':
      return 'pendente';
    case 'analisando':
      return 'analise';
    case 'recusado':
      return 'recusado';
    case 'rascunho':
      return 'rascunho';
    default:
      return 'default';
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'aprovado':
      return 'Aprovado';
    case 'pendente':
      return 'Pendente';
    case 'analisando':
      return 'Em análise';
    case 'recusado':
      return 'Recusado';
    case 'rascunho':
      return 'Rascunho';
    default:
      return status;
  }
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
