import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mosqueIdError, setMosqueIdError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mosqueId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear mosque ID error when user starts typing
    if (name === 'mosqueId') {
      setMosqueIdError(null);
    }
  };

  const validateMosqueId = (mosqueId: string): boolean => {
    if (!mosqueId && userType === 'admin') {
      setMosqueIdError("Mosque ID is required for mosque administrators");
      return false;
    }

    const mosqueIdPattern = /^MSQ\d{9}$/;
    if (mosqueId && !mosqueIdPattern.test(mosqueId)) {
      setMosqueIdError("Invalid mosque ID format. The ID should start with 'MSQ' followed by 9 digits");
      return false;
    }

    setMosqueIdError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate mosque ID before submitting
    if (userType === 'admin' && !validateMosqueId(formData.mosqueId)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiRequest('POST', '/api/login', {
        email: formData.email,
        password: formData.password,
        mosqueId: userType === 'admin' ? formData.mosqueId : undefined,
        userType
      });

      toast({
        title: "Success",
        description: "Logged in successfully!"
      });

      // Redirect based on user type
      navigate(userType === 'admin' ? '/admin/dashboard' : '/');
    } catch (error) {
      let errorMessage = "Failed to log in. ";
      
      if (error instanceof Error) {
        const data = JSON.parse(error.message);
        if (data.message.includes("Mosque not found") || 
            data.message.includes("mosque ID") ||
            data.message.includes("pending verification")) {
          setMosqueIdError(data.message);
        } else {
          errorMessage += data.message || "Please check your credentials and try again.";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 bg-white shadow-lg border-primary/20 border-2">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 p-3 rounded-full w-16 h-16 mx-auto mb-4">
            <i className="fas fa-mosque text-primary text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to MosqueTime</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="flex gap-2 p-1 bg-primary/5 rounded-lg">
          <Button 
            variant={userType === 'user' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setUserType('user')}
          >
            User
          </Button>
          <Button 
            variant={userType === 'admin' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setUserType('admin')}
          >
            Mosque Admin
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input 
              name="email"
              type="email" 
              placeholder="Enter your email" 
              className="w-full"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input 
              name="password"
              type="password" 
              placeholder="Enter your password" 
              className="w-full"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {userType === 'admin' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mosque ID</label>
              <Input 
                name="mosqueId"
                type="text" 
                placeholder="Enter mosque ID (e.g., MSQ123456789)" 
                className={`w-full ${mosqueIdError ? 'border-red-500' : ''}`}
                value={formData.mosqueId}
                onChange={handleChange}
                onBlur={() => validateMosqueId(formData.mosqueId)}
                required={userType === 'admin'}
              />
              {mosqueIdError && (
                <p className="text-xs text-red-500">{mosqueIdError}</p>
              )}
              <p className="text-xs text-gray-500">
                Enter the Mosque ID provided during registration
              </p>
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <a href="#" className="text-primary hover:underline">Forgot password?</a>
          <div className="mt-2 text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
