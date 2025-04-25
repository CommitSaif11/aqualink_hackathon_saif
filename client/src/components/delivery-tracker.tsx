import { WaterRequest } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapIcon, Droplet } from "lucide-react";

// Water Drop Icon Component
const WaterDropIcon = ({ className }: { className?: string }) => {
  return <Droplet className={className} />;
};

interface DeliveryTrackerProps {
  activeDeliveries: WaterRequest[];
  onTrackDelivery: (delivery: WaterRequest) => void;
}

export default function DeliveryTracker({ 
  activeDeliveries, 
  onTrackDelivery 
}: DeliveryTrackerProps) {
  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "in_transit":
        return "In Transit";
      case "completed":
        return "Delivered";
      default:
        return status;
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "accepted":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "in_transit":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  };

  // Calculate progress step
  const getProgressStep = (status: string) => {
    switch (status) {
      case "pending":
        return 0;
      case "accepted":
        return 1;
      case "in_transit":
        return 2;
      case "completed":
        return 3;
      default:
        return 0;
    }
  };

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Track Current Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeDeliveries.length > 0 ? (
            activeDeliveries.map((delivery) => {
              const progressStep = getProgressStep(delivery.status);
              
              return (
                <div key={delivery.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{delivery.requestId}</h3>
                      <p className="text-sm text-neutral-600">{delivery.waterAmount}L - {delivery.urgency}</p>
                    </div>
                    <Badge variant="outline" className={getStatusBadgeClass(delivery.status)}>
                      {getStatusLabel(delivery.status)}
                    </Badge>
                  </div>
                  
                  <div className="relative pt-4">
                    <div className="flex items-center mb-2">
                      {/* Requested */}
                      <div className="bg-green-500 rounded-full h-3 w-3 flex-shrink-0"></div>
                      <div className={`h-0.5 w-1/3 mx-1 ${progressStep >= 1 ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
                      
                      {/* Accepted */}
                      <div className={
                        progressStep >= 1 
                          ? "bg-green-500 rounded-full h-3 w-3 flex-shrink-0" 
                          : "border-2 border-neutral-300 bg-white rounded-full h-3 w-3 flex-shrink-0"
                      }></div>
                      <div className={`h-0.5 w-1/3 mx-1 ${progressStep >= 2 ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
                      
                      {/* In Transit */}
                      <div className={
                        progressStep >= 2 
                          ? "bg-green-500 rounded-full h-3 w-3 flex-shrink-0" 
                          : progressStep === 1 
                          ? "border-2 border-yellow-500 bg-white rounded-full h-3 w-3 flex-shrink-0"
                          : "border-2 border-neutral-300 bg-white rounded-full h-3 w-3 flex-shrink-0"
                      }></div>
                      <div className={`h-0.5 w-1/3 mx-1 ${progressStep >= 3 ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
                      
                      {/* Delivered */}
                      <div className={
                        progressStep >= 3 
                          ? "bg-green-500 rounded-full h-3 w-3 flex-shrink-0" 
                          : "border-2 border-neutral-300 bg-white rounded-full h-3 w-3 flex-shrink-0"
                      }></div>
                    </div>
                    <div className="grid grid-cols-4 text-xs text-neutral-600">
                      <div>Requested</div>
                      <div>Accepted</div>
                      <div>In Transit</div>
                      <div>Delivered</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="link" 
                      className="text-sm p-0 flex items-center text-primary hover:text-primary-dark"
                      onClick={() => onTrackDelivery(delivery)}
                    >
                      View on map <MapIcon className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <WaterDropIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No active deliveries at the moment</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
