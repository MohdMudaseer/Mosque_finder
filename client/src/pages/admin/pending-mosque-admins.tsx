import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PendingAdmin {
  id: number;
  fullName: string;
  email: string;
  username: string;
  isVerified: boolean;
  role: string;
}

export default function PendingMosqueAdmins() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingAdmins = [], isLoading } = useQuery<PendingAdmin[]>({
    queryKey: ['/api/admin/pending-mosque-admins'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/pending-mosque-admins');
      return response;
    }
  });

  const verifyAdmin = useMutation({
    mutationFn: async (userId: number) =>
      await apiRequest('POST', `/api/admin/verify-mosque-admin/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-mosque-admins'] });
      toast({
        title: "Success",
        description: "Mosque admin verified and mosque ID sent via email."
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify mosque admin",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Mosque Admin Verifications</h1>
      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading pending admins...</p>
        </div>
      ) : pendingAdmins.length === 0 ? (
        <div className="text-center py-8">
          <p>No pending mosque admins.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingAdmins.map((admin) => (
            <Card key={admin.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{admin.fullName}</h3>
                  <p className="text-sm text-gray-600">Username: {admin.username}</p>
                  <p className="text-sm text-gray-600">Email: {admin.email}</p>
                </div>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => verifyAdmin.mutate(admin.id)}
                >
                  Verify & Send Mosque ID
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
