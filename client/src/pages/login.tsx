
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function LoginPage() {
  const [userType, setUserType] = useState<'user' | 'admin'>('user');

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

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input type="email" placeholder="Enter your email" className="w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input type="password" placeholder="Enter your password" className="w-full" />
          </div>
          {userType === 'admin' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mosque ID</label>
              <Input type="text" placeholder="Enter mosque ID" className="w-full" />
            </div>
          )}
          <Button className="w-full bg-primary hover:bg-primary/90">
            Sign In
          </Button>
        </div>

        <div className="text-center text-sm">
          <a href="#" className="text-primary hover:underline">Forgot password?</a>
          <div className="mt-2 text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="text-primary hover:underline">Sign up</a>
          </div>
        </div>
      </Card>
    </div>
  );
}
