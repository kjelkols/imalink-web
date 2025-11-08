'use client';

import { VisibilityLevel, VISIBILITY_LEVELS } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lock, Users, UserCheck, Globe, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VisibilitySelectorProps {
  value: VisibilityLevel;
  onChange: (value: VisibilityLevel) => void;
  disabled?: boolean;
  className?: string;
}

const iconMap = {
  lock: Lock,
  users: Users,
  'user-check': UserCheck,
  globe: Globe,
};

export function VisibilitySelector({
  value,
  onChange,
  disabled = false,
  className,
}: VisibilitySelectorProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium mb-2 block">Visibility</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select visibility" />
        </SelectTrigger>
        <SelectContent>
          {VISIBILITY_LEVELS.map((level) => {
            const Icon = iconMap[level.icon as keyof typeof iconMap];
            const isSpaceDisabled = level.value === 'space';

            return (
              <SelectItem
                key={level.value}
                value={level.value}
                disabled={isSpaceDisabled}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{level.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {level.description}
                    </span>
                  </div>
                  {isSpaceDisabled && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Spaces coming in Phase 2</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
