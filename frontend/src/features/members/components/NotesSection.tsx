import React from "react";
import { Pin, Plus, Trash2, StickyNote } from "lucide-react";
import { WidgetContainer } from "../../dashboard/widgets/WidgetContainer";
import { WidgetHeader } from "../../dashboard/widgets/WidgetHeader";
import { WidgetBody } from "../../dashboard/widgets/WidgetBody";
import { WidgetEmptyState } from "../../dashboard/widgets/WidgetEmptyState";
import { Button } from "../../../../components/ui/Button";
import { MemberNote } from "../types/profile";
import { cn } from "../../../../lib/utils";

interface NotesSectionProps {
  notes?: MemberNote[];
  isLoading: boolean;
}

export function NotesSection({ notes, isLoading }: NotesSectionProps) {
  const sorted = notes
    ? [...notes].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
    : [];

  return (
    <WidgetContainer>
      <WidgetHeader
        title="Notes"
        action={
          <Button size="sm" className="h-7 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
          </Button>
        }
      />
      <WidgetBody
        isLoading={isLoading}
        isEmpty={!sorted.length}
        emptyState={
          <WidgetEmptyState
            title="No Notes Yet"
            description="Add notes about this member's preferences, injuries, or goals."
            icon={<StickyNote className="h-6 w-6 text-muted" />}
          />
        }
      >
        <div className="space-y-3">
          {sorted.map((note) => (
            <div
              key={note.id}
              className={cn(
                "relative rounded-xl p-4 border transition-colors group",
                note.isPinned
                  ? "bg-warning/5 border-warning/20"
                  : "bg-surface-hover border-default"
              )}
            >
              {note.isPinned && (
                <Pin className="absolute top-3 right-3 h-3.5 w-3.5 text-warning rotate-45" />
              )}
              <p className="text-sm text-primary leading-relaxed pr-4">{note.content}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted">
                  {note.authorName} · {new Date(note.createdAt).toLocaleDateString()}
                </span>
                <button className="opacity-0 group-hover:opacity-100 text-muted hover:text-error transition-all touch-target">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </WidgetBody>
    </WidgetContainer>
  );
}
