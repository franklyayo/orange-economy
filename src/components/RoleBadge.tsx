import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Star } from 'lucide-react';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export default function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  if (role === 'admin') {
    return (
      <Badge variant="destructive" className={`flex items-center gap-1 text-xs ${className}`}>
        <ShieldCheck className="w-3 h-3" />
        Admin
      </Badge>
    );
  }
  if (role === 'creative') {
    return (
      <Badge variant="default" className={`bg-orange-600 hover:bg-orange-700 flex items-center gap-1 text-xs ${className}`}>
        <Star className="w-3 h-3" />
        Creative
      </Badge>
    );
  }
  return null; // normal users show nothing
}
