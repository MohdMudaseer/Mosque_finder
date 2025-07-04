import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RequireAdminProps {
  children: React.ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/me'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/me');
        return response;
      } catch (error) {
        return null;
      }
    },
  });

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'admin' && user.role !== 'committee'))) {
      toast({
        title: "Access Denied",
        description: "You must be logged in as an admin to view this page.",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [user, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-2xl mb-3"></i>
          <p className="text-neutral-dark/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'committee')) {
    return null;
  }

  return <>{children}</>;
}
