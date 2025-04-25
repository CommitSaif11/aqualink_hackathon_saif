import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateRequestId } from "@/lib/utils";

const requestFormSchema = z.object({
  address: z.string().min(1, { message: "Address is required" }),
  waterAmount: z.string(),
  urgency: z.string(),
  notes: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface RequestFormProps {
  userId?: string;
}

export default function RequestForm({ userId }: RequestFormProps) {
  const { toast } = useToast();
  
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      address: "",
      waterAmount: "2000",
      urgency: "normal",
      notes: "",
    },
  });

  const requestMutation = useMutation({
    mutationFn: (values: RequestFormValues) => {
      const requestData = {
        requestId: generateRequestId(),
        userId: 1, // TODO: Replace with actual user ID from auth
        address: values.address,
        waterAmount: parseInt(values.waterAmount),
        urgency: values.urgency,
        notes: values.notes,
        latitude: 0, // These should be replaced with actual coordinates
        longitude: 0,
      };
      return apiRequest("POST", "/api/requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests/user/1'] });
      form.reset();
      toast({
        title: "Request submitted",
        description: "Your water delivery request has been submitted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Request failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });
  
  function onSubmit(values: RequestFormValues) {
    requestMutation.mutate(values);
  }

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Request Water Delivery</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Full delivery address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="waterAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Water Amount (Liters)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1000">1000 L</SelectItem>
                        <SelectItem value="2000">2000 L</SelectItem>
                        <SelectItem value="3000">3000 L</SelectItem>
                        <SelectItem value="5000">5000 L</SelectItem>
                        <SelectItem value="10000">10000 L</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal (24-48 hours)</SelectItem>
                        <SelectItem value="urgent">Urgent (8-12 hours)</SelectItem>
                        <SelectItem value="emergency">Emergency (ASAP)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Special instructions or additional details..." 
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-3">
              <Button 
                type="submit"
                className="w-full md:w-auto"
                disabled={requestMutation.isPending}
              >
                {requestMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
