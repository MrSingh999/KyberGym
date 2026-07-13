import * as React from "react"
import { MapPin, Mail, Phone, Calendar } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../data-display/Avatar"
import { cn } from "../../lib/utils"

export interface MemberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  joinDate?: string;
  status: "active" | "inactive" | "pending";
  avatarUrl?: string;
}

const statusMap = {
  active: { variant: "success" as const, label: "Active" },
  inactive: { variant: "destructive" as const, label: "Inactive" },
  pending: { variant: "warning" as const, label: "Pending" },
};

export function MemberCard({ 
  name, 
  email, 
  phone, 
  location, 
  joinDate,
  status, 
  avatarUrl,
  className,
  ...props 
}: MemberCardProps) {
  return (
    <Card className={cn("group hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden", className)} {...props}>
      <CardContent className="p-5 flex flex-col h-full gap-4">
        
        {/* Header: Avatar & Status */}
        <div className="flex items-start justify-between">
          <Avatar className="h-12 w-12 border-2 border-surface">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Badge variant={statusMap[status].variant}>
            {statusMap[status].label}
          </Badge>
        </div>
        
        {/* Body: Name & Primary Info */}
        <div>
          <h3 className="font-heading font-semibold text-lg text-primary truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center text-sm text-secondary mt-1">
            <Mail className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        </div>
        
        {/* Footer: Secondary Metadata */}
        <div className="mt-auto pt-4 border-t border-subtle flex flex-wrap gap-y-2 gap-x-4 text-xs text-muted">
          {phone && (
            <div className="flex items-center">
              <Phone className="mr-1 h-3 w-3" />
              {phone}
            </div>
          )}
          {location && (
            <div className="flex items-center">
              <MapPin className="mr-1 h-3 w-3" />
              {location}
            </div>
          )}
          {joinDate && (
            <div className="flex items-center ml-auto text-secondary">
              <Calendar className="mr-1 h-3 w-3" />
              Joined {joinDate}
            </div>
          )}
        </div>
        
      </CardContent>
    </Card>
  )
}
