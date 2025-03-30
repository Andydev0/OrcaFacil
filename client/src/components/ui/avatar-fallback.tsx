import React from 'react';
import { getInitials } from '@/lib/utils';

// Cores para os avatares
const COLORS = [
  ['#FF5733', '#900C3F'], // Vermelho e bordô
  ['#3498DB', '#1A5276'], // Azul claro e azul escuro
  ['#2ECC71', '#1D8348'], // Verde claro e verde escuro
  ['#F1C40F', '#B7950B'], // Amarelo e dourado
  ['#9B59B6', '#76448A'], // Roxo claro e roxo escuro
  ['#E74C3C', '#922B21'], // Vermelho claro e vermelho escuro
  ['#1ABC9C', '#148F77'], // Turquesa e turquesa escuro
  ['#D35400', '#A04000'], // Laranja e laranja escuro
  ['#34495E', '#212F3D'], // Azul acinzentado e azul escuro
  ['#7F8C8D', '#616A6B'], // Cinza claro e cinza escuro
];

interface AvatarFallbackProps {
  name: string;
  size?: number;
  fontSize?: number;
  className?: string;
}

/**
 * Componente que gera um avatar colorido com as iniciais do usuário
 */
export const ColorAvatar: React.FC<AvatarFallbackProps> = ({
  name,
  size = 40,
  fontSize = 16,
  className = '',
}) => {
  // Gera um índice baseado no nome para selecionar uma cor consistente
  const colorIndex = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length;
  
  const [primaryColor, secondaryColor] = COLORS[colorIndex];
  const initials = getInitials(name);
  
  return (
    <div
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        color: 'white',
        fontSize: `${fontSize}px`,
        fontWeight: 'bold',
      }}
    >
      {initials}
    </div>
  );
};

/**
 * Gera um estilo CSS para um avatar baseado no nome
 */
export function getAvatarStyle(name: string) {
  const colorIndex = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length;
  
  const [primaryColor, secondaryColor] = COLORS[colorIndex];
  
  return {
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    color: 'white',
  };
}

export default ColorAvatar;
