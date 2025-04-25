import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FcGoogle } from "react-icons/fc";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

// Registration form schema
const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["resident", "driver"]),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { signIn, signUp, signInWithGoogle, error } = useAuth();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "resident",
      terms: false,
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password);
      toast({
        title: "Logged in successfully",
        description: "Welcome to AquaLink!",
      });
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (data: RegisterFormValues) => {
    try {
      await signUp(data.email, data.password, data.role, data.firstName, data.lastName);
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
      setActiveTab("login");
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Display error messages from auth context
  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleGoogleSignIn = async () => {
    try {
      console.log("Starting Google sign-in from auth page...");
      // Using a direct implementation with firebase auth instead of the context
      // to better diagnose issues
      const result = await signInWithGoogle();
      console.log("Google sign-in success:", result.user.email);
      
      toast({
        title: "Logged in successfully",
        description: "Welcome to AquaLink!",
      });
    } catch (err: any) {
      console.error("Google sign-in error in auth page:", err);
      toast({
        title: "Google sign-in failed",
        description: err.message || "Authentication failed. Make sure Google sign-in is enabled in Firebase.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="p-8 space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Droplet className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-neutral-900">AquaLink</h2>
            <p className="mt-2 text-sm text-neutral-600">Smart Water Tanker Platform</p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 mt-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Remember me</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <Button variant="link" className="text-sm p-0">
                      Forgot password?
                    </Button>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Sign in
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-neutral-500">Or continue with</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 flex items-center gap-2"
                  onClick={handleGoogleSignIn}
                >
                  <FcGoogle className="h-5 w-5" />
                  Sign in with Google
                </Button>
              </div>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am a</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="resident">Resident (request water)</SelectItem>
                            <SelectItem value="driver">Tanker Driver</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="leading-none">
                          <FormLabel className="text-sm">
                            I agree to the <Button variant="link" className="p-0 h-auto text-sm">Terms of Service</Button> and <Button variant="link" className="p-0 h-auto text-sm">Privacy Policy</Button>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-neutral-500">Or sign up with</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 flex items-center gap-2"
                  onClick={handleGoogleSignIn}
                >
                  <FcGoogle className="h-5 w-5" />
                  Sign up with Google
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="text-destructive text-sm text-center">{error}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
