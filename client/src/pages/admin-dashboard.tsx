import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { WaterRequest, Anomaly } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import MapComponent from "@/components/map-component";
import AnomalyItem from "@/components/anomaly-item";
import { Droplet, TruckIcon, CheckCircleIcon, ClockIcon, FileDownIcon, SearchIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  
  // Fetch data
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/requests'],
    enabled: !!user,
  });
  
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['/api/users/role/driver'],
    enabled: !!user,
  });
  
  const { data: anomalies, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['/api/anomalies'],
    enabled: !!user,
  });
  
  const { data: driverLocations, isLoading: locationsLoading } = useQuery({
    queryKey: ['/api/locations'],
    enabled: !!user,
  });
  
  // Extract statistics
  const statistics = {
    activeRequests: requests?.filter(r => ["pending", "accepted", "in_transit"].includes(r.status)).length || 0,
    activeDrivers: drivers?.filter(d => d.id && driverLocations?.some(loc => loc.driverId === d.id)).length || 0,
    deliveriesToday: requests?.filter(r => 
      r.status === "completed" && 
      new Date(r.deliveredAt!).toDateString() === new Date().toDateString()
    ).length || 0,
    avgResponseTime: "1.8 hrs"
  };
  
  // Filter and sort requests
  const filteredRequests = requests
    ? requests
        .filter(r => 
          (statusFilter === "all" || r.status === statusFilter) &&
          (searchQuery === "" || 
           r.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.address.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];
  
  // Handle CSV export
  const handleExportCsv = () => {
    if (!requests || requests.length === 0) {
      toast({
        title: "Export failed",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }
    
    // Create CSV content
    const headers = ["Request ID", "Customer ID", "Address", "Amount", "Status", "Created At", "Completed At"];
    const csvRows = [headers.join(",")];
    
    requests.forEach(request => {
      const row = [
        request.requestId,
        request.userId,
        `"${request.address}"`, // Wrap in quotes to handle commas in address
        request.waterAmount,
        request.status,
        request.createdAt,
        request.deliveredAt || ""
      ];
      csvRows.push(row.join(","));
    });
    
    const csvContent = csvRows.join("\n");
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `aqualink-requests-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Request data has been exported to CSV",
    });
  };
  
  const handleInvestigateAnomaly = (anomalyId: number) => {
    apiRequest("PATCH", `/api/anomalies/${anomalyId}/resolve`, {})
      .then(() => {
        toast({
          title: "Anomaly marked as resolved",
          description: "The anomaly has been marked as investigated and resolved",
        });
      })
      .catch(error => {
        toast({
          title: "Failed to resolve anomaly",
          description: "An error occurred while resolving the anomaly",
          variant: "destructive",
        });
        console.error(error);
      });
  };
  
  if (requestsLoading || driversLoading || anomaliesLoading || locationsLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="bg-neutral-100 min-h-screen pb-12">
      <div className="bg-neutral-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold">AquaLink Admin Dashboard</h1>
              <p className="mt-1 text-neutral-300">Monitor and manage water delivery operations</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search requests..." 
                  className="w-full text-white placeholder-neutral-400 bg-neutral-700 border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchIcon className="absolute right-3 top-2.5 h-4 w-4 text-neutral-400" />
              </div>
              
              <Button 
                className="flex items-center gap-1"
                onClick={handleExportCsv}
              >
                <FileDownIcon className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-neutral-500 text-sm font-medium">Active Requests</h3>
                <Droplet className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-semibold">{statistics.activeRequests}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <span className="mr-1">↑</span> 12%
                </p>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded mt-4">
                <div className="h-2 bg-primary rounded" style={{ width: "75%" }}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-neutral-500 text-sm font-medium">Active Drivers</h3>
                <TruckIcon className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-semibold">{statistics.activeDrivers}</p>
                <p className="text-sm text-red-600 flex items-center">
                  <span className="mr-1">↓</span> 3%
                </p>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded mt-4">
                <div className="h-2 bg-secondary rounded" style={{ width: "60%" }}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-neutral-500 text-sm font-medium">Deliveries Today</h3>
                <CheckCircleIcon className="h-5 w-5 text-accent" />
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-semibold">{statistics.deliveriesToday}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <span className="mr-1">↑</span> 8%
                </p>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded mt-4">
                <div className="h-2 bg-accent rounded" style={{ width: "85%" }}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-neutral-500 text-sm font-medium">Avg Response Time</h3>
                <ClockIcon className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-semibold">{statistics.avgResponseTime}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <span className="mr-1">↑</span> 5%
                </p>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded mt-4">
                <div className="h-2 bg-yellow-500 rounded" style={{ width: "45%" }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Live Map and Anomalies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Live Map */}
          <Card className="shadow lg:col-span-2">
            <CardHeader className="p-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Live Request Map</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Droplet className="h-3.5 w-3.5" /> Requests
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <TruckIcon className="h-3.5 w-3.5" /> Drivers
                  </Button>
                </div>
              </div>
            </CardHeader>
            <div className="admin-map p-0">
              <MapComponent 
                requests={requests || []} 
                driverLocations={driverLocations || []}
                selectedRequestId={selectedRequestId}
                onSelectRequest={setSelectedRequestId}
              />
            </div>
          </Card>
          
          {/* Anomalies */}
          <Card className="shadow">
            <CardHeader className="p-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Anomaly Detections</CardTitle>
                <Button variant="link" size="sm" className="h-6">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-neutral-200">
              {anomalies && anomalies.length > 0 ? (
                anomalies
                  .filter(a => !a.resolved)
                  .slice(0, 3)
                  .map(anomaly => (
                    <AnomalyItem 
                      key={anomaly.id} 
                      anomaly={anomaly} 
                      onInvestigate={() => handleInvestigateAnomaly(anomaly.id)} 
                    />
                  ))
              ) : (
                <div className="p-6 text-center text-neutral-500">
                  <p>No anomalies detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Requests Table */}
        <Card className="shadow">
          <CardHeader className="p-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Recent Requests</CardTitle>
              <div className="flex space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-8 text-sm">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={handleExportCsv}
                >
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.slice(0, 10).map(request => (
                  <TableRow key={request.id} onClick={() => setSelectedRequestId(request.id)}>
                    <TableCell className="font-medium">{request.requestId}</TableCell>
                    <TableCell>User ID: {request.userId}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.address}</TableCell>
                    <TableCell>{request.waterAmount}L</TableCell>
                    <TableCell>{request.driverId ? `Driver ID: ${request.driverId}` : 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          request.status === 'pending' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                          request.status === 'accepted' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                          request.status === 'in_transit' ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' :
                          'bg-green-100 text-green-800 hover:bg-green-100'
                        }
                      >
                        {request.status === 'pending' ? 'Pending' :
                         request.status === 'accepted' ? 'Accepted' :
                         request.status === 'in_transit' ? 'In Transit' :
                         'Completed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" size="sm" className="h-6">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-neutral-500">
                      No requests found matching the filter criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-6 py-3 border-t bg-neutral-50 flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-neutral-700">
                Showing <span className="font-medium">1-{Math.min(filteredRequests.length, 10)}</span> of <span className="font-medium">{filteredRequests.length}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled={true}>Previous</Button>
              <Button variant="default" size="sm" className="px-3">1</Button>
              <Button variant="outline" size="sm" disabled={filteredRequests.length <= 10}>Next</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
