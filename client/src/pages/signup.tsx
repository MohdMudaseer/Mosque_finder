import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/utils";

export default function SignupPage() {
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    mosqueName: '',
    mosqueAddress: '',
    mosqueCity: '',
    mosqueContactNumber: ''
  });

  // Track if fields have been touched
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false
  });

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const passwordValidation = (password: string) => {
    const requirements = [
      { regex: /.{8,}/, label: 'At least 8 characters', met: false },
      { regex: /[A-Z]/, label: 'One uppercase letter', met: false },
      { regex: /[a-z]/, label: 'One lowercase letter', met: false },
      { regex: /[0-9]/, label: 'One number', met: false }
    ];
    
    return requirements.map(req => ({
      ...req,
      met: req.regex.test(password)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all required fields
      if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
        throw new Error("Please fill in all required fields");
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Check all password requirements
      const validations = passwordValidation(formData.password);
      if (!validations.every(v => v.met)) {
        throw new Error("Please meet all password requirements");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // For admin type, validate mosque details
      if (userType === 'admin' && !formData.mosqueName) {
        throw new Error("Mosque name is required for admin registration");
      }

      // First, create the user account
      console.log('Creating user account...'); 
      const response = await apiRequest('POST', '/api/users', {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        fullName: formData.fullName,
        role: userType === 'admin' ? 'committee' : 'user'
      });

      console.log('User created successfully:', response);

      if (userType === 'admin' && formData.mosqueName) {
        // If user is an admin, create the mosque
        console.log('Creating mosque...'); 
        await apiRequest('POST', '/api/mosques', {
          name: formData.mosqueName,
          address: formData.mosqueAddress || 'To be updated',
          city: formData.mosqueCity || 'To be updated',
          contactNumber: formData.mosqueContactNumber,
          email: formData.email,
          createdBy: response.id,
          latitude: '0',
          longitude: '0',
          imageUrl: '/default-mosque.jpg'
        });

        toast({
          title: "Success",
          description: "Account created! Your mosque registration is pending verification."
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully!"
        });
      }

      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = "Failed to create account. ";
      
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message);
          errorMessage += parsed.message || error.message;
        } catch {
          errorMessage += error.message;
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

  const currentPasswordValidation = passwordValidation(formData.password);
  const showPasswordValidation = touched.password && formData.password.length > 0;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 bg-white shadow-lg border-primary/20 border-2">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 p-3 rounded-full w-16 h-16 mx-auto mb-4">
            <i className="fas fa-mosque text-primary text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-600">Sign up to get started</p>
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
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <Input 
              name="fullName"
              type="text" 
              placeholder="Enter your full name" 
              className="w-full"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
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
            <label className="text-sm font-medium text-gray-700">Username</label>
            <Input 
              name="username"
              type="text" 
              placeholder="Choose a username" 
              className="w-full"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input 
              name="password"
              type="password" 
              placeholder="Choose a password" 
              className="w-full"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              required
            />
            {showPasswordValidation && (
              <div className="text-xs space-y-1">
                {currentPasswordValidation.map((req, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-1 ${
                      req.met ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {req.met ? '✓' : '•'} {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <Input 
              name="confirmPassword"
              type="password" 
              placeholder="Confirm your password" 
              className="w-full"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              required
            />
            {touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>
          {userType === 'admin' && (
            <>
              <div className="pt-4 border-t">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mosque Details</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mosque Name</label>
                    <Input 
                      name="mosqueName"
                      type="text" 
                      placeholder="Enter mosque name" 
                      className="w-full"
                      value={formData.mosqueName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <Input 
                      name="mosqueAddress"
                      type="text" 
                      placeholder="Enter mosque address" 
                      className="w-full"
                      value={formData.mosqueAddress}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <Input 
                      name="mosqueCity"
                      type="text" 
                      placeholder="Enter mosque city" 
                      className="w-full"
                      value={formData.mosqueCity}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Contact Number</label>
                    <Input 
                      name="mosqueContactNumber"
                      type="tel" 
                      placeholder="Enter mosque contact number" 
                      className="w-full"
                      value={formData.mosqueContactNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </Card>
    </div>
  );
}
