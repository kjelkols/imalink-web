'use client';

import { VisibilityLevel } from '@/lib/types';
import { Lock, Users, UserCheck, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VisibilityBadgeProps {
  visibility: VisibilityLevel;
  className?: string;
  showLabel?: boolean;
}

const visibilityConfig = {
  private: {
    icon: Lock,
    label: 'Private',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  space: {
    icon: Users,
    label: 'Space',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  authenticated: {
    icon: UserCheck,
    label: 'Authenticated',
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  public: {
    icon: Globe,
    label: 'Public',
    variant: 'secondary' as const,
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  },
};

export function VisibilityBadge({
  visibility,
  className,
  showLabel = true,
}: VisibilityBadgeProps) {
  const config = visibilityConfig[visibility];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, 'flex items-center gap-1', className)}
    >
      <Icon className="h-3 w-3" />
      {showLabel && <span className="text-xs">{config.label}</span>}
    </Badge>
  );
}
