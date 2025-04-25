import { Anomaly } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { calculateTimeAgo } from "@/lib/utils";
import { AlertTriangleIcon, ClockIcon, MapPinOffIcon } from "lucide-react";

interface AnomalyItemProps {
  anomaly: Anomaly;
  onInvestigate: () => void;
}

export default function AnomalyItem({ anomaly, onInvestigate }: AnomalyItemProps) {
  // Get icon based on anomaly type
  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "volume_mismatch":
        return (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600">
            <AlertTriangleIcon className="h-4 w-4" />
          </span>
        );
      case "delay":
        return (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 text-yellow-600">
            <ClockIcon className="h-4 w-4" />
          </span>
        );
      case "location_mismatch":
        return (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-600">
            <MapPinOffIcon className="h-4 w-4" />
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
            <AlertTriangleIcon className="h-4 w-4" />
          </span>
        );
    }
  };
  
  // Get anomaly title
  const getAnomalyTitle = (type: string) => {
    switch (type) {
      case "volume_mismatch":
        return "Volume Mismatch";
      case "delay":
        return "Delayed Delivery";
      case "location_mismatch":
        return "Location Mismatch";
      default:
        return "Anomaly Detected";
    }
  };

  return (
    <div className="p-4 hover:bg-neutral-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {getAnomalyIcon(anomaly.type)}
          <h3 className="ml-3 font-medium text-neutral-900">
            {getAnomalyTitle(anomaly.type)}
          </h3>
        </div>
        <span className="text-sm text-neutral-500">
          {calculateTimeAgo(anomaly.createdAt)}
        </span>
      </div>
      <p className="text-sm text-neutral-600 ml-11">{anomaly.description}</p>
      <p className="text-sm text-neutral-500 ml-11 mt-1">
        Request #{anomaly.requestId}
      </p>
      <div className="ml-11 mt-2">
        <Button 
          variant="link" 
          className="p-0 h-auto text-primary hover:text-primary-dark"
          onClick={onInvestigate}
        >
          Investigate
        </Button>
      </div>
    </div>
  );
}
