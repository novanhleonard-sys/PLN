import { icons } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface IconProps {
  name: keyof typeof icons;
  className?: string;
  size?: number | string;
  color?: string;
}

export function Icon({ name, className, size = 24, color = 'currentColor' }: IconProps) {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon className={cn('flex-shrink-0', className)} size={size} color={color} />;
}
