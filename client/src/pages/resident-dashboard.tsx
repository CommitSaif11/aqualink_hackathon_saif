import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { WaterRequest } from "@shared/schema";
import StatsCard from "@/components/stats-card";
import RequestForm from "@/components/request-form";
import DeliveryTracker from "@/components/delivery-tracker";
import DeliveryHistory from "@/components/delivery-history";
import TrackingModal from "@/components/tracking-modal";
import RatingModal from "@/components/rating-modal";
import { Droplet, CheckCircleIcon, ClockIcon } from "lucide-react";

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<WaterRequest | null>(null);
  
  // Fetch user requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/requests/user/1'], // TODO: Replace with actual user ID
    enabled: !!user,
  });
  
  // Derived data
  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const completedRequests = requests?.filter(r => r.status === "completed") || [];
  const activeDeliveries = requests?.filter(r => ["accepted", "in_transit"].includes(r.status)) || [];
  
  // Calculate average wait time (mock for now)
  const avgWaitTime = "2.5 hrs";
  
  // Open tracking modal for a delivery
  const handleTrackDelivery = (delivery: WaterRequest) => {
    setSelectedDelivery(delivery);
    setTrackingModalOpen(true);
  };
  
  // Open rating modal for a delivery
  const handleRateDelivery = (delivery: WaterRequest) => {
    setSelectedDelivery(delivery);
    setRatingModalOpen(true);
  };
  
  // Show rating dialog for completed unrated deliveries
  useEffect(() => {
    const unratedCompletedDelivery = completedRequests.find(d => 
      d.status === "completed" && !d.rating && !ratingModalOpen
    );
    
    if (unratedCompletedDelivery) {
      setSelectedDelivery(unratedCompletedDelivery);
      setRatingModalOpen(true);
    }
  }, [completedRequests, ratingModalOpen]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="bg-neutral-100 min-h-screen pb-12">
      <div className="bg-primary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Water Request Dashboard</h1>
          <p className="mt-2">Request and track your water deliveries</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard 
            icon={<Droplet />} 
            title="Pending Requests" 
            value={pendingRequests.length.toString()} 
            color="blue" 
          />
          
          <StatsCard 
            icon={<CheckCircleIcon />} 
            title="Completed Deliveries" 
            value={completedRequests.length.toString()} 
            color="green" 
          />
          
          <StatsCard 
            icon={<ClockIcon />} 
            title="Average Wait Time" 
            value={avgWaitTime} 
            color="yellow" 
          />
        </div>
        
        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Request Card */}
          <div className="lg:col-span-2">
            <RequestForm userId={user?.uid} />
          </div>
          
          {/* Delivery Tracking Card */}
          <div>
            <DeliveryTracker 
              activeDeliveries={activeDeliveries} 
              onTrackDelivery={handleTrackDelivery} 
            />
          </div>
        </div>
        
        {/* Recent Deliveries */}
        <DeliveryHistory 
          deliveries={completedRequests.slice(0, 5)} 
          onRateDelivery={handleRateDelivery} 
        />
      </div>
      
      {/* Modals */}
      {selectedDelivery && (
        <>
          <TrackingModal 
            isOpen={trackingModalOpen}
            onClose={() => setTrackingModalOpen(false)}
            delivery={selectedDelivery}
          />
          
          <RatingModal 
            isOpen={ratingModalOpen}
            onClose={() => setRatingModalOpen(false)}
            delivery={selectedDelivery}
          />
        </>
      )}
    </div>
  );
}
