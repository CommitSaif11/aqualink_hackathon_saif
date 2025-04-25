import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "accepted":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "in_transit":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    default:
      return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
  }
}

export function getUrgencyBadgeColor(urgency: string): string {
  switch (urgency) {
    case "emergency":
      return "bg-red-100 text-red-800";
    case "urgent":
      return "bg-yellow-100 text-yellow-800";
    case "normal":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-neutral-100 text-neutral-800";
  }
}

export function generateRequestId(): string {
  const prefix = 'WD';
  const randomNumbers = Math.floor(10000 + Math.random() * 90000); // 5-digit number
  return `${prefix}${randomNumbers}`;
}

export function calculateTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}
