import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/utils";

interface OTPProps {
  email: string;
  onVerified: () => void;
}

export default function OTPVerification({ email, onVerified }: OTPProps) {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(10);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  // Timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);
  const handleResend = async () => {
    setCanResend(false);
    setTimer(10);
    try {
      await apiRequest("POST", "/api/otp/request-otp", { email });
      toast({ title: "OTP Resent", description: "A new OTP has been sent to your email." });
    } catch (error) {
      let errorMessage = "Failed to resend OTP. ";
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message);
          errorMessage += parsed.error || error.message;
        } catch {
          errorMessage += error.message;
        }
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/otp/verify-otp", { email, otp });
      toast({ title: "Verified!", description: "Your email has been verified." });
      setVerified(true);
      setTimeout(() => onVerified(), 500); // Give a short delay for UI feedback
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

  if (verified) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <span className="text-green-600 font-semibold text-xs bg-green-50 px-2 py-1 rounded">Email verified!</span>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-gray-700">Enter OTP</span>
        <span className="text-xs text-muted-foreground">{canResend ? "You can resend OTP" : `Resend in ${timer}s`}</span>
        <Button type="button" size="sm" variant="outline" className="ml-2 px-2 py-1 h-7 text-xs border-primary text-primary hover:bg-primary/10" onClick={handleResend} disabled={!canResend}>
          Resend OTP
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-1">
        <Input
          name="otp"
          type="text"
          placeholder="Enter the 6-digit code"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          maxLength={6}
          required
          className="w-32"
        />
        <Button type="submit" className="h-10 px-4" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </div>
  );
}
