import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Mosque } from "@/lib/maps";

export default function PendingMosques() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);

  const { data: pendingMosques = [], isLoading } = useQuery<Mosque[]>({
    queryKey: ['/api/mosques/pending'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/mosques/pending');
      return response;
    }
  });

  const verifyMosque = useMutation({
    mutationFn: async ({ mosqueId, verified }: { mosqueId: number; verified: boolean }) => {
      return await apiRequest('POST', `/api/mosques/${mosqueId}/verify`, { verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mosques/pending'] });
      toast({
        title: "Success",
        description: "Mosque verification status updated successfully.",
      });
      setSelectedMosque(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update verification status",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Mosque Verifications</h1>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading pending verifications...</p>
        </div>
      ) : pendingMosques.length === 0 ? (
        <div className="text-center py-8">
          <p>No pending mosque verifications.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingMosques.map((mosque) => (
            <Card key={mosque.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{mosque.name}</h3>
                  <p className="text-sm text-gray-600">{mosque.address}, {mosque.city}</p>
                  <p className="text-sm text-gray-600">Mosque ID: {mosque.mosqueIdentifier}</p>
                  <p className="text-sm text-gray-600">Contact: {mosque.contactNumber}</p>
                  <p className="text-sm text-gray-600">Email: {mosque.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => verifyMosque.mutate({ mosqueId: mosque.id, verified: true })}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => verifyMosque.mutate({ mosqueId: mosque.id, verified: false })}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
