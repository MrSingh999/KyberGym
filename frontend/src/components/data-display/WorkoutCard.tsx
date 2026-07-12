import * as React from "react"
import { Dumbbell, Clock, Flame, Play } from "lucide-react"
import { Card, CardContent } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { cn } from "../../lib/utils"

export interface WorkoutCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  category: string;
  duration: number; // minutes
  intensity: "low" | "medium" | "high";
  exercisesCount: number;
  imageUrl?: string;
}

const intensityMap = {
  low: { color: "text-success", label: "Low Intensity" },
  medium: { color: "text-warning", label: "Med Intensity" },
  high: { color: "text-error", label: "High Intensity" },
};

export function WorkoutCard({ 
  title,
  category,
  duration,
  intensity,
  exercisesCount,
  imageUrl,
  className,
  ...props 
}: WorkoutCardProps) {
  return (
    <Card className={cn("overflow-hidden group hover:shadow-md transition-all flex flex-col", className)} {...props}>
      {/* Image Banner */}
      <div className="relative h-32 w-full bg-surface-hover overflow-hidden shrink-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted bg-gradient-to-br from-surface to-surface-hover">
            <Dumbbell className="h-10 w-10 opacity-20" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-canvas/90 backdrop-blur text-primary border-transparent shadow-sm">
            {category}
          </Badge>
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-semibold text-lg text-primary line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs font-medium text-secondary">
          <div className="flex items-center">
            <Clock className="mr-1.5 h-3.5 w-3.5 text-muted" />
            {duration} min
          </div>
          <div className="flex items-center">
            <Flame className={cn("mr-1.5 h-3.5 w-3.5", intensityMap[intensity].color)} />
            {intensityMap[intensity].label}
          </div>
        </div>

        <div className="mt-auto pt-5 flex items-center justify-between">
          <div className="text-xs text-muted">
            <span className="font-semibold text-primary">{exercisesCount}</span> exercises
          </div>
          <Button size="sm" className="rounded-full h-8 px-4 font-semibold text-xs shadow-none">
            Start <Play className="ml-1.5 h-3 w-3 fill-current" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
