import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/utils";

interface OTPProps {
  email: string;
  onVerified: () => void;
}

export default function OTPVerification({ email, onVerified }: OTPProps) {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/otp/verify-otp", { email, otp });
      toast({ title: "Verified!", description: "Your email has been verified." });
      onVerified();
    } catch (error) {
      let errorMessage = "Failed to verify OTP. ";
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message);
          errorMessage += parsed.error || error.message;
        } catch {
          errorMessage += error.message;
        }
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6 bg-white shadow-lg border-primary/20 border-2">
      <h2 className="text-xl font-bold text-center">Enter OTP</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="otp"
          type="text"
          placeholder="Enter the 6-digit code"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          maxLength={6}
          required
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </Card>
  );
}
