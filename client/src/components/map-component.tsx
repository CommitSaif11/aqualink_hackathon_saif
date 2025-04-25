import { useState, useEffect, useRef } from "react";
import { WaterRequest, DriverLocation } from "@shared/schema";
import { Card } from "@/components/ui/card";

interface MapComponentProps {
  requests: WaterRequest[];
  driverLocations: DriverLocation[];
  selectedRequestId?: number | null;
  currentLocation?: { lat: number; lng: number } | null;
  showDriversOnly?: boolean;
}

export default function MapComponent({ 
  requests, 
  driverLocations, 
  selectedRequestId,
  currentLocation,
  showDriversOnly = false
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // This is a simplified map implementation using SVG
  // In a real-world application, you would integrate Google Maps or Leaflet
  
  // Calculate map dimensions
  const mapWidth = 800;
  const mapHeight = 500;
  
  // Generate some mock coordinates for demonstration
  // In a real app, these would come from the actual lat/lng data
  useEffect(() => {
    if (!mapRef.current || mapInitialized) return;
    
    // Initialize the map
    setMapInitialized(true);
    
    // In a real implementation:
    // 1. Initialize Google Maps or Leaflet here
    // 2. Add markers for requests and drivers
    // 3. Set up event listeners
    // 4. Handle real-time updates
  }, [mapRef, mapInitialized]);
  
  // Generate SVG marker for requests
  const renderRequestMarkers = () => {
    if (showDriversOnly) return null;
    
    return requests.map((request, index) => {
      // Mock coordinates (in a real app, use request.latitude and request.longitude)
      const x = 100 + (index * 50) % (mapWidth - 200);
      const y = 100 + (index * 70) % (mapHeight - 200);
      
      const isSelected = request.id === selectedRequestId;
      
      return (
        <g key={request.id} transform={`translate(${x}, ${y})`}>
          <circle 
            r={isSelected ? 12 : 10} 
            fill={isSelected ? "rgba(3, 105, 161, 0.8)" : "rgba(3, 169, 244, 0.7)"} 
            stroke={isSelected ? "#0277bd" : "none"}
            strokeWidth="2"
          />
          <text 
            textAnchor="middle" 
            y="3" 
            fill="white" 
            fontSize="10" 
            fontWeight="bold"
          >
            W
          </text>
          {isSelected && (
            <text 
              textAnchor="middle"
              y="-20"
              fill="#0277bd"
              fontSize="12"
              fontWeight="bold"
            >
              {request.requestId}
            </text>
          )}
        </g>
      );
    });
  };
  
  // Generate SVG marker for drivers
  const renderDriverMarkers = () => {
    const markers = driverLocations.map((location, index) => {
      // Mock coordinates (in a real app, use location.latitude and location.longitude)
      const x = 300 + (index * 80) % (mapWidth - 200);
      const y = 200 + (index * 60) % (mapHeight - 200);
      
      return (
        <g key={location.id} transform={`translate(${x}, ${y})`}>
          <circle 
            r={10} 
            fill="rgba(76, 175, 80, 0.7)" 
            stroke="#388e3c"
            strokeWidth="2"
          />
          <text 
            textAnchor="middle" 
            y="3" 
            fill="white" 
            fontSize="10" 
            fontWeight="bold"
          >
            D
          </text>
          <text 
            textAnchor="middle"
            y="-16"
            fill="#388e3c"
            fontSize="10"
          >
            Driver #{location.driverId}
          </text>
        </g>
      );
    });
    
    // Add current location if available
    if (currentLocation) {
      markers.push(
        <g key="current-location" transform={`translate(${mapWidth/2}, ${mapHeight/2})`}>
          <circle 
            r={8} 
            fill="rgba(255, 87, 34, 0.7)" 
            stroke="#e64a19"
            strokeWidth="2"
          />
          <circle 
            r={16} 
            fill="rgba(255, 87, 34, 0.2)" 
            stroke="#e64a19"
            strokeWidth="1"
          />
          <text 
            textAnchor="middle"
            y="-20"
            fill="#e64a19"
            fontSize="10"
            fontWeight="bold"
          >
            You are here
          </text>
        </g>
      );
    }
    
    return markers;
  };
  
  // Render a simplified map (in a real app, this would be a Google Maps or Leaflet instance)
  return (
    <Card className="w-full h-full overflow-hidden" ref={mapRef}>
      <div className="w-full h-full bg-neutral-100 relative">
        <svg width="100%" height="100%" viewBox={`0 0 ${mapWidth} ${mapHeight}`} preserveAspectRatio="xMidYMid meet">
          {/* Map grid lines */}
          <g stroke="rgba(200, 200, 200, 0.3)" strokeWidth="1">
            {Array.from({ length: 10 }).map((_, i) => (
              <line 
                key={`h-${i}`} 
                x1="0" 
                y1={i * mapHeight / 10} 
                x2={mapWidth} 
                y2={i * mapHeight / 10} 
              />
            ))}
            {Array.from({ length: 16 }).map((_, i) => (
              <line 
                key={`v-${i}`} 
                x1={i * mapWidth / 16} 
                y1="0" 
                x2={i * mapWidth / 16} 
                y2={mapHeight} 
              />
            ))}
          </g>
          
          {/* City names - would be real locations in a real app */}
          <text x="100" y="50" fill="#666" fontSize="12">Downtown</text>
          <text x="300" y="80" fill="#666" fontSize="12">Greenwood</text>
          <text x="500" y="150" fill="#666" fontSize="12">Riverside</text>
          <text x="150" y="250" fill="#666" fontSize="12">Oakwood</text>
          <text x="400" y="350" fill="#666" fontSize="12">Westview</text>
          
          {/* Roads */}
          <path 
            d="M50,100 L350,100 L600,250 M200,50 L200,400 M350,100 L350,300 L500,450" 
            stroke="#ccc" 
            strokeWidth="8" 
            fill="none" 
          />
          <path 
            d="M50,100 L350,100 L600,250 M200,50 L200,400 M350,100 L350,300 L500,450" 
            stroke="#fff" 
            strokeWidth="6" 
            strokeDasharray="10,10"
            fill="none" 
          />
          
          {/* Request & Driver markers */}
          {renderRequestMarkers()}
          {renderDriverMarkers()}
        </svg>
        
        {/* Map controls (mocked) */}
        <div className="absolute top-4 right-4 bg-white rounded shadow-md p-2 flex flex-col space-y-2">
          <button className="h-8 w-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5l0 14M5 12l14 0" />
            </svg>
          </button>
          <button className="h-8 w-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
        
        {/* Map attribution */}
        <div className="absolute bottom-1 left-2 text-xs text-neutral-500">
          <em>
            This is a simplified map visualization. In a production app, this would use Google Maps or OpenStreetMap.
          </em>
        </div>
      </div>
    </Card>
  );
}
