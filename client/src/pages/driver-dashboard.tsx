import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { WaterRequest } from "@shared/schema";
import StatsCard from "@/components/stats-card";
import CurrentDelivery from "@/components/current-delivery";
import TaskItem from "@/components/task-item";
import { Truck, CheckCircle2Icon, ClockIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Fetch driver data and active tasks
  const { data: activeDelivery, isLoading: activeDeliveryLoading } = useQuery({
    queryKey: ['/api/requests/driver/1/active'], // TODO: Replace with actual driver ID
    enabled: !!user,
  });
  
  const { data: availableTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/requests/status/pending'],
    enabled: !!user,
  });
  
  const { data: driverStats } = useQuery({
    queryKey: ['/api/drivers/1/stats'], // TODO: Replace with actual driver ID
    enabled: !!user,
  });
  
  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: (location: { lat: number, lng: number }) => 
      apiRequest("POST", "/api/locations", {
        driverId: 1, // TODO: Replace with actual driver ID
        latitude: location.lat,
        longitude: location.lng
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations/driver/1'] });
      toast({
        title: "Location updated",
        description: "Your current location has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Location update failed",
        description: "Could not update your location. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Accept task mutation
  const acceptTaskMutation = useMutation({
    mutationFn: (requestId: number) => 
      apiRequest("PATCH", `/api/requests/${requestId}`, {
        status: "accepted",
        driverId: 1, // TODO: Replace with actual driver ID
        acceptedAt: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests/status/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/requests/driver/1/active'] });
      toast({
        title: "Task accepted",
        description: "You have successfully accepted the task.",
      });
    },
    onError: (error) => {
      toast({
        title: "Task acceptance failed",
        description: "Could not accept the task. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Update delivery status mutation
  const updateDeliveryStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: string }) =>
      apiRequest("PATCH", `/api/requests/${requestId}`, {
        status,
        ...(status === "in_transit" ? { inTransitAt: new Date().toISOString() } : {}),
        ...(status === "completed" ? { deliveredAt: new Date().toISOString() } : {})
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests/driver/1/active'] });
      toast({
        title: "Status updated",
        description: "Delivery status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Status update failed",
        description: "Could not update delivery status. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Handle updating current location
  const handleUpdateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          updateLocationMutation.mutate(location);
        },
        (error) => {
          toast({
            title: "Geolocation error",
            description: "Could not get your current location: " + error.message,
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation",
        variant: "destructive",
      });
    }
  };
  
  // Handle accepting a task
  const handleAcceptTask = (task: WaterRequest) => {
    acceptTaskMutation.mutate(task.id);
  };
  
  // Handle updating delivery status
  const handleUpdateDeliveryStatus = (requestId: number, status: string) => {
    updateDeliveryStatusMutation.mutate({ requestId, status });
  };
  
  if (tasksLoading || activeDeliveryLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Stats values (use real data if available, otherwise fallback to placeholders)
  const statsData = {
    availableTasks: availableTasks?.length || 0,
    acceptedTasks: driverStats?.acceptedTasks || 0,
    completedToday: driverStats?.completedToday || 0,
    rating: driverStats?.rating || "4.8/5"
  };

  return (
    <div className="bg-neutral-100 min-h-screen pb-12">
      <div className="bg-primary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <p className="mt-2">Manage and track your delivery tasks</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            icon={<Truck />}
            title="Available Tasks"
            value={statsData.availableTasks.toString()}
            color="blue"
          />
          
          <StatsCard 
            icon={<ClockIcon />}
            title="Accepted Tasks"
            value={statsData.acceptedTasks.toString()}
            color="yellow"
          />
          
          <StatsCard 
            icon={<CheckCircle2Icon />}
            title="Completed Today"
            value={statsData.completedToday.toString()}
            color="green"
          />
          
          <StatsCard 
            icon={<StarIcon />}
            title="Rating"
            value={statsData.rating}
            color="blue"
          />
        </div>
        
        {/* Active Delivery Card */}
        <div className="mb-8">
          <CurrentDelivery 
            delivery={activeDelivery}
            currentLocation={currentLocation}
            onUpdateLocation={handleUpdateLocation}
            onUpdateStatus={handleUpdateDeliveryStatus}
          />
        </div>
        
        {/* Available Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Available Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {availableTasks && availableTasks.length > 0 ? (
              <div className="space-y-4">
                {availableTasks.map((task) => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    onAccept={() => handleAcceptTask(task)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg">No tasks available at the moment</p>
                <p className="text-sm mt-1">Check back soon for new water delivery requests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
