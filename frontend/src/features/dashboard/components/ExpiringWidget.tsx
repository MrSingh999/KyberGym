import React from "react";
import { WidgetContainer, WidgetHeader, WidgetBody } from "../widgets/WidgetContainer";
import { Badge } from "../../../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../../../components/data-display/Avatar";
import { Button } from "../../../../components/ui/Button";

const expiringMock = [
  { id: "1", name: "David Kim", plan: "Pro Monthly", days: 1 },
  { id: "2", name: "Emma Watson", plan: "Basic Annual", days: 3 },
  { id: "3", name: "James Smith", plan: "Elite Weekly", days: 7 },
];

export function ExpiringWidget() {
  return (
    <WidgetContainer>
      <WidgetHeader 
        title="Expiring Soon" 
        action={
          <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold">
            View All
          </Button>
        } 
      />
      <WidgetBody scrollable>
        <div className="space-y-4">
          {expiringMock.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-default hover:border-hover hover:bg-surface-hover transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-primary truncate">{member.name}</span>
                  <span className="text-xs text-secondary truncate">{member.plan}</span>
                </div>
              </div>
              <Badge variant={member.days <= 3 ? "destructive" : "warning"} className="shrink-0">
                {member.days} {member.days === 1 ? 'day' : 'days'}
              </Badge>
            </div>
          ))}
        </div>
      </WidgetBody>
    </WidgetContainer>
  );
}
