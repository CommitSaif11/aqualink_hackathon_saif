import { useState, useEffect } from "react";
import { WaterRequest } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Truck, Droplet } from "lucide-react";
import MapComponent from "@/components/map-component";

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: WaterRequest;
}

export default function TrackingModal({ isOpen, onClose, delivery }: TrackingModalProps) {
  // Get driver location
  const { data: driverLocation } = useQuery({
    queryKey: [`/api/locations/driver/${delivery.driverId}`],
    enabled: isOpen && !!delivery.driverId,
    refetchInterval: isOpen ? 10000 : false, // Refetch every 10 seconds when modal is open
  });
  
  // Format date/time
  const formatDateTime = (dateString: string | Date | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }) + ", " + date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate estimated arrival time (mock for now)
  const [estimatedArrival, setEstimatedArrival] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState<string>("");
  
  useEffect(() => {
    if (isOpen && delivery.status === "in_transit") {
      // This would be calculated based on actual distance/speed in a real app
      const now = new Date();
      const arrival = new Date(now.getTime() + 35 * 60000); // 35 minutes from now
      setEstimatedArrival(arrival.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
      setRemainingTime("approximately 35 min");
    }
  }, [isOpen, delivery.status]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Track Delivery {delivery.requestId}</DialogTitle>
        </DialogHeader>
        
        <div className="map-container rounded-lg mb-6 h-80 overflow-hidden">
          <MapComponent 
            requests={[delivery]} 
            driverLocations={driverLocation ? [driverLocation] : []}
            selectedRequestId={delivery.id}
            showDriversOnly={true}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-neutral-50">
            <CardContent className="p-4">
              <h3 className="text-sm text-neutral-500 mb-1">Estimated Arrival</h3>
              <p className="text-lg font-semibold">{estimatedArrival || "Calculating..."}</p>
              <p className="text-sm text-neutral-600">
                {remainingTime ? `In ${remainingTime}` : "Waiting for driver"}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-neutral-50">
            <CardContent className="p-4">
              <h3 className="text-sm text-neutral-500 mb-1">Driver</h3>
              <p className="text-lg font-semibold">
                {delivery.driverId ? `Driver ${delivery.driverId}` : "Not assigned yet"}
              </p>
              <p className="text-sm text-neutral-600">Rating: 4.8/5</p>
            </CardContent>
          </Card>
          
          <Card className="bg-neutral-50">
            <CardContent className="p-4">
              <h3 className="text-sm text-neutral-500 mb-1">Delivery</h3>
              <p className="text-lg font-semibold">{delivery.waterAmount}L</p>
              <p className="text-sm text-neutral-600 capitalize">{delivery.urgency}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Delivery Progress</h3>
          
          <div className="space-y-6">
            {/* Request Confirmed */}
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-green-500 text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div className="h-full w-0.5 bg-green-500 relative mx-auto mt-2"></div>
              </div>
              <div>
                <h4 className="text-base font-medium">Request Confirmed</h4>
                <p className="text-sm text-neutral-600">Your water request has been received and confirmed</p>
                <p className="text-xs text-neutral-500 mt-1">{formatDateTime(delivery.createdAt)}</p>
              </div>
            </div>
            
            {/* Driver Assigned */}
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                  delivery.status !== "pending" ? "bg-green-500 text-white" : "bg-white border-2 border-neutral-300 text-neutral-300"
                }`}>
                  <Check className="h-5 w-5" />
                </div>
                <div className={`h-full w-0.5 relative mx-auto mt-2 ${
                  delivery.status !== "pending" ? "bg-green-500" : "bg-neutral-300"
                }`}></div>
              </div>
              <div>
                <h4 className={`text-base font-medium ${
                  delivery.status === "pending" ? "text-neutral-400" : "text-neutral-900"
                }`}>Driver Assigned</h4>
                <p className={`text-sm ${
                  delivery.status === "pending" ? "text-neutral-400" : "text-neutral-600"
                }`}>
                  {delivery.driverId 
                    ? `Driver ${delivery.driverId} has been assigned to your delivery` 
                    : "Waiting for a driver to accept your request"}
                </p>
                <p className="text-xs text-neutral-500 mt-1">{formatDateTime(delivery.acceptedAt)}</p>
              </div>
            </div>
            
            {/* In Transit */}
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                  delivery.status === "in_transit" || delivery.status === "completed" 
                    ? "bg-yellow-500 text-white" 
                    : "bg-white border-2 border-neutral-300 text-neutral-300"
                }`}>
                  <Truck className="h-5 w-5" />
                </div>
                <div className={`h-full w-0.5 relative mx-auto mt-2 ${
                  delivery.status === "completed" ? "bg-green-500" : "bg-neutral-300"
                }`}></div>
              </div>
              <div>
                <h4 className={`text-base font-medium ${
                  delivery.status === "pending" || delivery.status === "accepted" ? "text-neutral-400" : "text-neutral-900"
                }`}>In Transit</h4>
                <p className={`text-sm ${
                  delivery.status === "pending" || delivery.status === "accepted" ? "text-neutral-400" : "text-neutral-600"
                }`}>
                  {delivery.status === "in_transit" 
                    ? "Driver is on the way to your location" 
                    : delivery.status === "completed" 
                    ? "Driver arrived at your location" 
                    : "Waiting for driver to start delivery"}
                </p>
                <p className="text-xs text-neutral-500 mt-1">{formatDateTime(delivery.inTransitAt)}</p>
              </div>
            </div>
            
            {/* Delivery Complete */}
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                  delivery.status === "completed" 
                    ? "bg-green-500 text-white" 
                    : "bg-white border-2 border-neutral-300 text-neutral-300"
                }`}>
                  <Droplet className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h4 className={`text-base font-medium ${
                  delivery.status === "completed" ? "text-neutral-900" : "text-neutral-400"
                }`}>Delivery Complete</h4>
                <p className={`text-sm ${
                  delivery.status === "completed" ? "text-neutral-600" : "text-neutral-400"
                }`}>
                  {delivery.status === "completed" 
                    ? "Water has been delivered to your location" 
                    : "Water will be delivered to your location"}
                </p>
                <p className="text-xs text-neutral-500 mt-1">{formatDateTime(delivery.deliveredAt)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
