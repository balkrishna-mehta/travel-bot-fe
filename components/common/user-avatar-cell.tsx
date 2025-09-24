import { IconUser } from "@tabler/icons-react";

interface UserAvatarCellProps {
  name: string;
  avatar?: string;
  subtitle?: string;
  phone?: string;
}

export function UserAvatarCell({
  name,
  avatar,
  subtitle,
  phone,
}: UserAvatarCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <IconUser className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div>
        <div className="font-medium">{name}</div>
        {subtitle && (
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        )}
        {phone && <div className="text-sm text-muted-foreground">{phone}</div>}
      </div>
    </div>
  );
}
