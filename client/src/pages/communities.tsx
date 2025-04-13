
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Communities() {
  const [filters, setFilters] = useState({
    type: "all",
    region: "",
    state: "",
    district: "",
  });

  const { data: communities, isLoading } = useQuery({
    queryKey: ["communities", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/communities?${params}`);
      return response.json();
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Communities</h1>
        <Button asChild>
          <Link to="/create-community">Create Community</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities?.map((community: any) => (
          <div key={community.id} className="bg-card rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
            <p className="text-muted-foreground mb-4">{community.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {community.type === "REGIONAL" 
                  ? `${community.district}, ${community.state}`
                  : "Scholarly Community"}
              </span>
              <Button variant="outline" asChild>
                <Link to={`/communities/${community.id}`}>Join</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
