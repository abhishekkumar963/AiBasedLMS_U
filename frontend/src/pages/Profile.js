import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, BookOpen, Calendar, Award, Settings, TrendingUp, BarChart3, Clock, Target, Zap, Check, X, Camera, Upload, MapPin, Globe, Github, Twitter, Linkedin, Instagram, Facebook, Palette, Music, Film, Gamepad2, Code, Coffee, Heart, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { initScrollAnimations, reinitAnimations } from '../utils/scrollAnimations';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    education: user?.profile?.education || '',
    interests: user?.profile?.interests?.join(', ') || '',
    gender: user?.profile?.gender || '',
    location: user?.profile?.location || '',
    website: user?.profile?.website || '',
    github: user?.profile?.github || '',
    twitter: user?.profile?.twitter || '',
    linkedin: user?.profile?.linkedin || '',
    instagram: user?.profile?.instagram || '',
    facebook: user?.profile?.facebook || '',
    favoriteMusic: user?.profile?.favoriteMusic || '',
    favoriteMovies: user?.profile?.favoriteMovies || '',
    favoriteGames: user?.profile?.favoriteGames || '',
    codingLanguages: user?.profile?.codingLanguages?.join(', ') || '',
    hobbies: user?.profile?.hobbies?.join(', ') || ''
  });

  // Debug logging
  console.log('Current active tab:', activeTab);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profile?.profilePhoto || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fileInputRef = useRef(null);

  // Initialize scroll animations
  useEffect(() => {
    initScrollAnimations();
  }, []);

  // Re-initialize animations when tab changes
  useEffect(() => {
    setTimeout(() => {
      reinitAnimations();
    }, 100);
  }, [activeTab]);

  // Sync profileData with user data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user?.name || '',
        bio: user?.profile?.bio || '',
        education: user?.profile?.education || '',
        interests: user?.profile?.interests?.join(', ') || '',
        gender: user?.profile?.gender || '',
        location: user?.profile?.location || '',
        website: user?.profile?.website || '',
        github: user?.profile?.github || '',
        twitter: user?.profile?.twitter || '',
        linkedin: user?.profile?.linkedin || '',
        instagram: user?.profile?.instagram || '',
        facebook: user?.profile?.facebook || '',
        favoriteMusic: user?.profile?.favoriteMusic || '',
        favoriteMovies: user?.profile?.favoriteMovies || '',
        favoriteGames: user?.profile?.favoriteGames || '',
        codingLanguages: user?.profile?.codingLanguages?.join(', ') || '',
        hobbies: user?.profile?.hobbies?.join(', ') || ''
      });
    }
  }, [user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage('Please upload an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB');
        return;
      }

      setProfilePhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePhoto = async () => {
    if (!profilePhoto) return;
    
    setUploadingPhoto(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('profilePhoto', profilePhoto);
    
    try {
      const response = await axios.post('/api/auth/upload-profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await updateProfile({ profilePhoto: response.data.profilePhoto });
      setMessage('Profile photo updated successfully!');
      setProfilePhoto(null);
    } catch (error) {
      setMessage('Failed to upload profile photo');
      console.error('Upload error:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removeProfilePhoto = async () => {
    try {
      await axios.delete('/api/auth/remove-profile-photo');
      setPhotoPreview(null);
      await updateProfile({ profilePhoto: null });
      setMessage('Profile photo removed successfully!');
    } catch (error) {
      setMessage('Failed to remove profile photo');
      console.error('Remove photo error:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('An error occurred while updating profile');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('An error occurred while changing password');
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Profile Overview', icon: BarChart3 },
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'security', label: 'Security', icon: Settings },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="cyber-grid"></div>
      
      <div className="particles">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-display text-neon mb-2">My Profile</h1>
              <p className="text-white text-lg">
                Manage your account settings and learning journey
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-400">
                  {user?.enrolledCourses?.length || 0}
                </div>
                <div className="text-xs text-gray-300">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neonGreen-400">
                  {user?.profile?.codingLanguages?.length || 0}
                </div>
                <div className="text-xs text-gray-300">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round((Object.values(user?.profile || {}).filter(val => val && val !== '').length / 15) * 100)}%
                </div>
                <div className="text-xs text-gray-300">Complete</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="card ">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-500 to-purple-500 p-1 neon-glow-blue">
                    <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-neon-400" />
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-neon-500 rounded-full flex items-center justify-center hover-scale neon-glow-blue"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                {profilePhoto && (
                  <div className="mb-4">
                    <button
                      onClick={uploadProfilePhoto}
                      disabled={uploadingPhoto}
                      className="btn-neon-green disabled:opacity-50 hover-scale"
                    >
                      {uploadingPhoto ? (
                        <>
                          <div className="spinner w-4 h-4 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Save New Photo
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                <h2 className="heading-large text-white mb-2">{user?.name}</h2>
                <div className="flex items-center justify-center mb-4">
                  <Mail className="w-4 h-4 text-gray-300 mr-2" />
                  <span className="text-gray-300">{user?.email}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-gray-300 mr-2" />
                  <span className="text-gray-300">
                    Member since {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-white/20">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-neon-400 mr-2" />
                    <span className="text-gray-300 text-sm">Courses</span>
                  </div>
                  <span className="text-white font-bold">{user?.enrolledCourses?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-white/20">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-neonGreen-400 mr-2" />
                    <span className="text-gray-300 text-sm">Skills</span>
                  </div>
                  <span className="text-white font-bold">{user?.profile?.codingLanguages?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-white/20">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="text-gray-300 text-sm">Complete</span>
                  </div>
                  <span className="text-white font-bold">
                    {Math.round((Object.values(user?.profile || {}).filter(val => val && val !== '').length / 15) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex space-x-2 mb-8 p-2 glass-card rounded-2xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-neon-500 to-purple-500 text-white neon-glow-blue'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'overview' && (
              <div className="card ">
                <div className="flex items-center mb-6">
                  <BarChart3 className="w-8 h-8 text-neon-400 mr-3" />
                  <h3 className="heading-large text-white">📝 Complete Profile Overview</h3>
                  <div className="ml-auto">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-400">
                          {Math.round((Object.values(user?.profile || {}).filter(val => val && val !== '').length / 15) * 100)}%
                        </div>
                        <div className="text-xs text-gray-300">Profile Complete</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neonGreen-400">
                          {user?.profile?.bio ? user?.enrolledCourses?.length || 0 : 0}
                        </div>
                        <div className="text-xs text-gray-300">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {user?.profile?.codingLanguages?.length || 0}
                        </div>
                        <div className="text-xs text-gray-300">Skills</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="glass-card p-6 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">👤 Personal Info</h4>
                      <span className="text-neon-400 text-sm">100% Complete</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Name</span>
                        <span className="text-white font-medium">{user?.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Email</span>
                        <span className="text-white font-medium">{user?.email || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Gender</span>
                        <span className="text-white font-medium">
                          {user?.profile?.gender === 'male' ? '👨 Male' : 
                           user?.profile?.gender === 'female' ? '👩 Female' : 
                           user?.profile?.gender === 'other' ? '🧑 Other' : 
                           user?.profile?.gender === 'prefer-not-to-say' ? '🤷 Private' : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Location</span>
                        <span className="text-white font-medium">{user?.profile?.location || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Member Since</span>
                        <span className="text-white font-medium">{new Date(user?.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">🌐 Professional Info</h4>
                      <span className="text-neon-400 text-sm">80% Complete</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Education</span>
                        <span className="text-white font-medium">{user?.profile?.education || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Website</span>
                        <span className="text-white font-medium truncate max-w-xs">
                          {user?.profile?.website ? (
                            <a href={user?.profile?.website} target="_blank" className="text-neon-400 hover:underline">
                              {user?.profile?.website}
                            </a>
                          ) : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Languages</span>
                        <span className="text-white font-medium">
                          {user?.profile?.codingLanguages?.length > 0 ? user?.profile?.codingLanguages.join(', ') : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Interests</span>
                        <span className="text-white font-medium">
                          {user?.profile?.interests?.length > 0 ? user?.profile?.interests.join(', ') : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">🔗 Social Media</h4>
                      <span className="text-neon-400 text-sm">60% Complete</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {user?.profile?.github && (
                        <div className="flex items-center space-x-2 p-2 bg-dark-800/30 rounded-lg">
                          <Github className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          <a href={`https://github.com/${user?.profile?.github}`} target="_blank" rel="noopener noreferrer" className="text-neon-400 hover:underline truncate">
                            {user?.profile?.github}
                          </a>
                        </div>
                      )}
                      {user?.profile?.twitter && (
                        <div className="flex items-center space-x-2 p-2 bg-dark-800/30 rounded-lg">
                          <Twitter className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          <a href={`https://twitter.com/${user?.profile?.twitter}`} target="_blank" rel="noopener noreferrer" className="text-neon-400 hover:underline truncate">
                            @{user?.profile?.twitter}
                          </a>
                        </div>
                      )}
                      {user?.profile?.linkedin && (
                        <div className="flex items-center space-x-2 p-2 bg-dark-800/30 rounded-lg">
                          <Linkedin className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          <a href={`https://linkedin.com/in/${user?.profile?.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-neon-400 hover:underline truncate">
                            {user?.profile?.linkedin}
                          </a>
                        </div>
                      )}
                      {user?.profile?.instagram && (
                        <div className="flex items-center space-x-2 p-2 bg-dark-800/30 rounded-lg">
                          <Instagram className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          <a href={`https://instagram.com/${user?.profile?.instagram}`} target="_blank" rel="noopener noreferrer" className="text-neon-400 hover:underline truncate">
                            @{user?.profile?.instagram}
                          </a>
                        </div>
                      )}
                      {user?.profile?.facebook && (
                        <div className="flex items-center space-x-2 p-2 bg-dark-800/30 rounded-lg">
                          <Facebook className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          <a href={`https://facebook.com/${user?.profile?.facebook}`} target="_blank" rel="noopener noreferrer" className="text-neon-400 hover:underline truncate">
                            {user?.profile?.facebook}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="glass-card p-6 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">🎮 Entertainment</h4>
                      <span className="text-neon-400 text-sm">40% Complete</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Favorite Music</span>
                        <span className="text-white font-medium">{user?.profile?.favoriteMusic || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Favorite Movies</span>
                        <span className="text-white font-medium">{user?.profile?.favoriteMovies || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Favorite Games</span>
                        <span className="text-white font-medium">{user?.profile?.favoriteGames || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Hobbies</span>
                        <span className="text-white font-medium">
                          {user?.profile?.hobbies?.length > 0 ? user?.profile?.hobbies.join(', ') : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">📝 Bio</h4>
                      <span className="text-neon-400 text-sm">{user?.profile?.bio ? `${user?.profile?.bio.length}/500` : '0/500'} chars</span>
                    </div>
                    <div className="mt-4 p-4 bg-dark-800/50 rounded-xl border border-white/20">
                      <p className="text-white leading-relaxed">
                        {user?.profile?.bio || 'No bio added yet. Click on "Edit Profile" to add your bio!'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="card ">
                <div className="flex items-center mb-6">
                  <User className="w-6 h-6 text-neon-400 mr-3" />
                  <h3 className="heading-large text-white">Edit Profile Information</h3>
                </div>
                
                {message && (
                  <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
                    message.includes('success') 
                      ? 'bg-neonGreen-500/10 text-neonGreen-400 border-neonGreen-400/30 neon-glow-green' 
                      : 'bg-red-500/10 text-red-400 border-red-400/30'
                  }`}>
                    <div className="flex items-center">
                      {message.includes('success') ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      {message}
                    </div>
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                    <label className="block text-white font-bold mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                    <label className="block text-white font-bold mb-2">Gender</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                      className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none"
                    >
                      <option value="" className="text-gray-900">Select gender...</option>
                      <option value="male" className="text-gray-900">Male</option>
                      <option value="female" className="text-gray-900">Female</option>
                      <option value="other" className="text-gray-900">Other</option>
                      <option value="prefer-not-to-say" className="text-gray-900">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                    <label className="block text-white font-bold mb-2">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>

                  <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                    <label className="block text-white font-bold mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none resize-none"
                      rows={4}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    <p className="text-gray-300 text-sm mt-2">{profileData.bio.length}/500 characters</p>
                  </div>

                  <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                    <label className="block text-white font-bold mb-2">Website</label>
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                      className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                      <label className="block text-white font-bold mb-2">GitHub</label>
                      <input
                        type="text"
                        value={profileData.github}
                        onChange={(e) => setProfileData({...profileData, github: e.target.value})}
                        className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none"
                        placeholder="github username"
                      />
                    </div>
                    <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                      <label className="block text-white font-bold mb-2">Twitter</label>
                      <input
                        type="text"
                        value={profileData.twitter}
                        onChange={(e) => setProfileData({...profileData, twitter: e.target.value})}
                        className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none"
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                    <label className="block text-white font-bold mb-2">Education</label>
                    <input
                      type="text"
                      value={profileData.education}
                      onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                      className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none"
                      placeholder="e.g., Bachelor's in Computer Science"
                    />
                  </div>

                  <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                    <label className="block text-white font-bold mb-2">Professional Interests</label>
                    <textarea
                      value={profileData.interests}
                      onChange={(e) => setProfileData({...profileData, interests: e.target.value})}
                      className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none resize-none"
                      rows={3}
                      placeholder="e.g., Web Development, Machine Learning, UI/UX Design, Data Science..."
                    />
                    <p className="text-gray-300 text-sm mt-2">Separate multiple interests with commas</p>
                  </div>

                  <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                    <label className="block text-white font-bold mb-2">Programming Languages</label>
                    <textarea
                      value={profileData.codingLanguages}
                      onChange={(e) => setProfileData({...profileData, codingLanguages: e.target.value})}
                      className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none resize-none"
                      rows={3}
                      placeholder="e.g., JavaScript, Python, React, Node.js, TypeScript..."
                    />
                    <p className="text-gray-300 text-sm mt-2">List your programming languages</p>
                  </div>

                  <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                    <label className="block text-white font-bold mb-2">Hobbies & Interests</label>
                    <textarea
                      value={profileData.hobbies}
                      onChange={(e) => setProfileData({...profileData, hobbies: e.target.value})}
                      className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none resize-none"
                      rows={3}
                      placeholder="e.g., Photography, Gaming, Reading, Hiking, Cooking..."
                    />
                    <p className="text-gray-300 text-sm mt-2">What do you enjoy doing in your free time?</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                      <label className="block text-white font-bold mb-2">Favorite Music</label>
                      <input
                        type="text"
                        value={profileData.favoriteMusic}
                        onChange={(e) => setProfileData({...profileData, favoriteMusic: e.target.value})}
                        className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none"
                        placeholder="e.g., Rock, Jazz, EDM..."
                      />
                    </div>
                    <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                      <label className="block text-white font-bold mb-2">Favorite Movies</label>
                      <input
                        type="text"
                        value={profileData.favoriteMovies}
                        onChange={(e) => setProfileData({...profileData, favoriteMovies: e.target.value})}
                        className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none"
                        placeholder="e.g., Sci-Fi, Action, Drama..."
                      />
                    </div>
                    <div className="p-6 bg-dark-800/50 rounded-xl border border-white/20">
                      <label className="block text-white font-bold mb-2">Favorite Games</label>
                      <input
                        type="text"
                        value={profileData.favoriteGames}
                        onChange={(e) => setProfileData({...profileData, favoriteGames: e.target.value})}
                        className="w-full p-3 rounded bg-white/10 text-white border border-white/30 focus:border-neon-400 focus:outline-none"
                        placeholder="e.g., RPG, Strategy, FPS..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-neon-500 to-purple-500 text-white p-4 rounded-xl font-bold hover:from-neon-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 neon-glow-blue"
                  >
                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card ">
                <div className="flex items-center mb-6">
                  <Settings className="w-6 h-6 text-neon-400 mr-3" />
                  <h3 className="heading-large text-white">Security Settings</h3>
                </div>

                {message && (
                  <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
                    message.includes('success') 
                      ? 'bg-neonGreen-500/10 text-neonGreen-400 border-neonGreen-400/30 neon-glow-green' 
                      : 'bg-red-500/10 text-red-400 border-red-400/30'
                  }`}>
                    <div className="flex items-center">
                      {message.includes('success') ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      {message}
                    </div>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="input-neon"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="input-neon"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                    <div className="mt-2 space-y-1">
                      <div className={`text-xs ${passwordData.newPassword.length >= 8 ? 'text-neonGreen-400' : 'text-gray-400'}`}>
                        {passwordData.newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                      </div>
                      <div className={`text-xs ${/[A-Z]/.test(passwordData.newPassword) ? 'text-neonGreen-400' : 'text-gray-400'}`}>
                        {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'} One uppercase letter
                      </div>
                      <div className={`text-xs ${/[a-z]/.test(passwordData.newPassword) ? 'text-neonGreen-400' : 'text-gray-400'}`}>
                        {/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'} One lowercase letter
                      </div>
                      <div className={`text-xs ${/[0-9]/.test(passwordData.newPassword) ? 'text-neonGreen-400' : 'text-gray-400'}`}>
                        {/[0-9]/.test(passwordData.newPassword) ? '✓' : '○'} One number
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="input-neon"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-red-400 text-xs mt-2">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-neon-blue w-full disabled:opacity-50 hover-scale"
                  >
                    {loading ? (
                      <>
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
