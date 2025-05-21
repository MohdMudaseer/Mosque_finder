import React from 'react';
import { useParams } from 'react-router-dom';

const CommunityChat = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Community Chat</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Chat functionality coming soon...</p>
      </div>
    </div>
  );
};

export default CommunityChat;
