import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">TEST PROFILE PAGE</h1>
        <div className="bg-red-500 p-8 rounded-xl text-white">
          <p>User: {user?.name || 'No user'}</p>
          <p>Email: {user?.email || 'No email'}</p>
          <p>Debug: Profile component is rendering!</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
