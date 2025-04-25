import { WaterRequest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUrgencyBadgeColor } from "@/lib/utils";

interface TaskItemProps {
  task: WaterRequest;
  onAccept: () => void;
}

export default function TaskItem({ task, onAccept }: TaskItemProps) {
  // Format distance (mocked for now but would be calculated from coordinates in a real app)
  const getDistance = (): string => {
    return "3.5 km away";
  };
  
  // Get urgency label
  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "Emergency";
      case "urgent":
        return "Urgent";
      case "normal":
        return "Normal";
      default:
        return urgency;
    }
  };

  return (
    <Card className="border border-neutral-200 hover:bg-neutral-50 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">{task.requestId}</h3>
              <Badge 
                variant="outline" 
                className={`ml-2 ${getUrgencyBadgeColor(task.urgency)}`}
              >
                {getUrgencyLabel(task.urgency)}
              </Badge>
            </div>
            <p className="text-neutral-600 mt-1">{task.waterAmount}L water delivery</p>
            <p className="text-sm text-neutral-500 mt-1">{task.address} • {getDistance()}</p>
            {task.notes && (
              <p className="text-sm text-neutral-500 mt-1 italic">Note: {task.notes}</p>
            )}
          </div>
          <Button 
            size="sm"
            className="whitespace-nowrap"
            onClick={onAccept}
          >
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
