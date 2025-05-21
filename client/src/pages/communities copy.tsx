import React from 'react';

const Communities = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Communities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Community cards will be added here */}
        <p className="text-gray-600">No communities available yet.</p>
      </div>
    </div>
  );
};

export default Communities;
