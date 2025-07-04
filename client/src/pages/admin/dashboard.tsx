import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/stats');
      return response;
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Pending Mosques</h3>
          <p className="text-2xl font-bold mb-4">{stats?.pendingMosques || 0}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/pending-mosques')}
          >
            View Pending Mosques
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Total Mosques</h3>
          <p className="text-2xl font-bold mb-4">{stats?.totalMosques || 0}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/find-mosques')}
          >
            View All Mosques
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Total Users</h3>
          <p className="text-2xl font-bold mb-4">{stats?.totalUsers || 0}</p>
        </Card>
      </div>
    </div>
  );
}