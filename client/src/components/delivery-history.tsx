import { useState } from "react";
import { WaterRequest } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Star, StarHalf } from "lucide-react";

interface DeliveryHistoryProps {
  deliveries: WaterRequest[];
  onRateDelivery: (delivery: WaterRequest) => void;
}

export default function DeliveryHistory({ deliveries, onRateDelivery }: DeliveryHistoryProps) {
  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Render stars for rating
  const renderRating = (rating: number | null) => {
    if (rating === null) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-yellow-400" />);
    }
    
    return (
      <div className="flex items-center">
        {stars}
      </div>
    );
  };

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {deliveries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.requestId}</TableCell>
                    <TableCell>{formatDate(delivery.deliveredAt || delivery.createdAt)}</TableCell>
                    <TableCell>{delivery.waterAmount}L</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell>Driver {delivery.driverId}</TableCell>
                    <TableCell>
                      {delivery.rating ? (
                        renderRating(delivery.rating)
                      ) : (
                        <Button
                          variant="link"
                          className="text-sm p-0"
                          onClick={() => onRateDelivery(delivery)}
                        >
                          Rate delivery
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <p>No delivery history available</p>
            </div>
          )}
        </div>
        
        {deliveries.length > 0 && (
          <div className="pt-4 flex justify-center">
            <Button variant="link">View all delivery history</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
