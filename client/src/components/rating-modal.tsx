import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { WaterRequest } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { StarHalf } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: WaterRequest;
}

export default function RatingModal({ isOpen, onClose, delivery }: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const { toast } = useToast();
  
  const ratingMutation = useMutation({
    mutationFn: () => {
      return apiRequest("PATCH", `/api/requests/${delivery.id}`, {
        rating,
        feedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests/user/1'] });
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Rating submission failed",
        description: "There was an error submitting your rating. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });
  
  const handleSetRating = (value: number) => {
    setRating(value);
  };
  
  const handleSubmitRating = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    ratingMutation.mutate();
  };
  
  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-light mx-auto mb-4">
              <StarHalf className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Rate Your Delivery</DialogTitle>
            <p className="text-neutral-600 mt-1">How was your experience with order {delivery.requestId}?</p>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-center items-center space-x-2 text-3xl text-yellow-400">
            {[1, 2, 3, 4, 5].map((value) => (
              <button 
                key={value}
                className="focus:outline-none transition-transform hover:scale-110" 
                onClick={() => handleSetRating(value)}
                aria-label={`Rate ${value} stars`}
              >
                <Star 
                  className={`h-8 w-8 ${value <= rating ? "fill-yellow-400" : ""}`} 
                />
              </button>
            ))}
          </div>
          
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-neutral-700 mb-1">
              Additional Feedback
            </label>
            <Textarea 
              id="feedback" 
              placeholder="Tell us about your experience..." 
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="pt-2 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleSkip}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmitRating}
            disabled={ratingMutation.isPending}
          >
            {ratingMutation.isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
