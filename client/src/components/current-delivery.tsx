import { WaterRequest } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeColor } from "@/lib/utils";
import { MapIcon, PhoneIcon, NavigationIcon, Locate, CheckCircleIcon, LocateOff, PersonStanding, ClipboardIcon } from "lucide-react";
import MapComponent from "./map-component";

interface CurrentDeliveryProps {
  delivery: WaterRequest | null | undefined;
  currentLocation: { lat: number; lng: number } | null;
  onUpdateLocation: () => void;
  onUpdateStatus: (requestId: number, status: string) => void;
}

export default function CurrentDelivery({ 
  delivery, 
  currentLocation, 
  onUpdateLocation, 
  onUpdateStatus 
}: CurrentDeliveryProps) {
  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "in_transit":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };
  
  // Get next status based on current status
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "accepted":
        return "in_transit";
      case "in_transit":
        return "completed";
      default:
        return currentStatus;
    }
  };
  
  // Get next status button label
  const getNextStatusButtonLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case "accepted":
        return "Start Delivery";
      case "in_transit":
        return "Mark as Delivered";
      default:
        return "Update Status";
    }
  };
  
  // Get urgency text color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "text-red-600";
      case "urgent":
        return "text-orange-600";
      case "normal":
        return "text-blue-600";
      default:
        return "text-neutral-600";
    }
  };
  
  if (!delivery) {
    return (
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Current Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-neutral-500">
            <div className="inline-flex rounded-full bg-neutral-100 p-3 mb-4">
              <MapIcon className="h-10 w-10 text-neutral-400" />
            </div>
            <p className="text-lg">No active delivery</p>
            <p className="text-sm mt-1">Accept a task from the list below to start delivering</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Current Delivery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-semibold">{delivery.requestId}</h3>
                <Badge 
                  variant="outline" 
                  className={`ml-3 ${getStatusBadgeColor(delivery.status)}`}
                >
                  {getStatusLabel(delivery.status)}
                </Badge>
              </div>
              <p className="text-neutral-600">{delivery.waterAmount}L water delivery to {delivery.address}</p>
              <p className="text-sm text-neutral-500 mt-1">
                Requested {new Date(delivery.createdAt).toLocaleDateString()} • 
                <span className={`ml-1 font-medium ${getUrgencyColor(delivery.urgency)}`}>
                  {delivery.urgency.charAt(0).toUpperCase() + delivery.urgency.slice(1)}
                </span>
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button 
                variant="secondary" 
                className="flex items-center gap-1"
                onClick={() => {
                  // In a real app, this would open navigation app with coordinates
                  window.open(`https://maps.google.com?q=${delivery.latitude},${delivery.longitude}`);
                }}
              >
                <NavigationIcon className="h-4 w-4" /> Navigate
              </Button>
              <Button 
                className="flex items-center gap-1"
                onClick={() => {
                  // In a real app, this would initiate a call to customer
                  alert("This would dial the customer's number in a real app");
                }}
              >
                <PhoneIcon className="h-4 w-4" /> Contact
              </Button>
            </div>
          </div>
          
          {/* Delivery map */}
          <div className="rounded-lg mb-6 h-80 overflow-hidden">
            <MapComponent 
              requests={[delivery]} 
              driverLocations={[]}
              selectedRequestId={delivery.id}
              currentLocation={currentLocation}
            />
          </div>
          
          {/* Delivery actions */}
          <div className="flex flex-wrap justify-between items-center">
            <div className="space-y-2 mb-4 md:mb-0">
              <div className="flex items-center">
                <LocateOff className="h-4 w-4 text-neutral-500 mr-1" />
                <span className="text-sm text-neutral-600">{delivery.address}</span>
              </div>
              <div className="flex items-center">
                <PersonStanding className="h-4 w-4 text-neutral-500 mr-1" />
                <span className="text-sm text-neutral-600">Customer #{delivery.userId}</span>
              </div>
              {delivery.notes && (
                <div className="flex items-center">
                  <ClipboardIcon className="h-4 w-4 text-neutral-500 mr-1" />
                  <span className="text-sm text-neutral-600">{delivery.notes}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline"
                className="flex items-center justify-center gap-1"
                onClick={onUpdateLocation}
              >
                <Locate className="h-4 w-4" /> Update Location
              </Button>
              {delivery.status !== "completed" && (
                <Button 
                  className="flex items-center justify-center gap-1"
                  onClick={() => onUpdateStatus(delivery.id, getNextStatus(delivery.status))}
                >
                  <CheckCircleIcon className="h-4 w-4" /> {getNextStatusButtonLabel(delivery.status)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
