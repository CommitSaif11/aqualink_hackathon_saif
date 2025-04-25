import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  color: "blue" | "green" | "yellow" | "red";
}

export default function StatsCard({ icon, title, value, color }: StatsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-primary";
      case "green":
        return "bg-green-100 text-accent";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      case "red":
        return "bg-red-100 text-destructive";
      default:
        return "bg-blue-100 text-primary";
    }
  };

  return (
    <Card className="shadow">
      <CardContent className="p-6 flex items-center">
        <div className={`rounded-full ${getColorClasses()} p-3 mr-4`}>
          <div className="h-6 w-6">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-neutral-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
