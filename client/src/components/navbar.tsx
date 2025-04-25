import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Droplet, MenuIcon } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const [location] = useLocation();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = () => {
    signOut();
  };
  
  // Determine which navigation links to show based on user role
  const getNavLinks = () => {
    if (userRole === "resident") {
      return [
        { href: "/resident", label: "Dashboard", active: location === "/resident" },
        { href: "/resident/requests", label: "My Requests", active: location === "/resident/requests" },
        { href: "/resident/profile", label: "Profile", active: location === "/resident/profile" },
      ];
    } else if (userRole === "driver") {
      return [
        { href: "/driver", label: "Dashboard", active: location === "/driver" },
        { href: "/driver/tasks", label: "My Tasks", active: location === "/driver/tasks" },
        { href: "/driver/profile", label: "Profile", active: location === "/driver/profile" },
      ];
    } else if (userRole === "admin") {
      return [
        { href: "/admin", label: "Dashboard", active: location === "/admin" },
        { href: "/admin/users", label: "Users", active: location === "/admin/users" },
        { href: "/admin/analytics", label: "Analytics", active: location === "/admin/analytics" },
        { href: "/admin/settings", label: "Settings", active: location === "/admin/settings" },
      ];
    }
    return [];
  };
  
  const navLinks = getNavLinks();

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Droplet className="h-6 w-6" />
            <h1 className="text-xl font-bold">AquaLink</h1>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User navigation links */}
            <div className="space-x-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`hover:text-blue-100 ${link.active ? 'font-medium' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* User info and logout */}
            <div className="flex items-center ml-4 space-x-3">
              <span className="text-sm">
                {user?.displayName || user?.email?.split('@')[0]}
              </span>
              <Avatar className="h-8 w-8 bg-primary-light">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                <AvatarFallback className="bg-primary-light text-white">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-primary-dark hover:bg-blue-800 text-white"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={`block py-2 hover:bg-primary-dark px-2 rounded ${
                  link.active ? 'font-medium bg-primary-dark' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-blue-400 mt-2 pt-2 flex justify-between items-center px-2">
              <span>
                {user?.displayName || user?.email?.split('@')[0]}
              </span>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-primary-dark hover:bg-blue-800 text-white"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
