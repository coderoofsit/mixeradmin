import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Shield, Plus, Edit, Eye, EyeOff, Save, X, Lock } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';

interface Admin {
  _id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions: {
    users: { view: boolean; create: boolean; update: boolean; delete: boolean; verify: boolean };
    organizers: { view: boolean; create: boolean; update: boolean; delete: boolean; verify: boolean };
    events: { view: boolean; create: boolean; update: boolean; delete: boolean; verify: boolean };
    stats: { view: boolean };
    system: { view: boolean; manage: boolean };
    admins: { view: boolean; create: boolean; update: boolean; delete: boolean };
  };
}

interface SuperAdminConfig {
  superAdmin: {
    username: string;
    email: string;
    name: string;
  };
  settings: {
    allowPasswordChange: boolean;
    requireStrongPassword: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
}

const AdminManagement: React.FC = () => {
  const { user } = useAuth();
  
  // Check if user has permission to access admin management - only super admin
  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-2">Only Super Administrators can access Admin Management.</p>
          <p className="text-sm text-var(--text-muted)">Your role: {user?.role || 'Unknown'}</p>
        </div>
      </div>
    );
  }

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [config, setConfig] = useState<SuperAdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (editingAdmin || showCreateModal || showPasswordModal || showConfigModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [editingAdmin, showCreateModal, showPasswordModal, showConfigModal]);

  // Form states
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    name: '',
    password: ''
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  
  // Loading states for admin actions
  const [actionLoading, setActionLoading] = useState<{
    delete?: boolean
    toggle?: boolean
    resetPassword?: boolean
  }>({})

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [configData, setConfigData] = useState<Partial<SuperAdminConfig>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminsResponse, configResponse] = await Promise.all([
        adminApi.getAllAdmins(),
        adminApi.getSuperAdminConfig()
      ]);

      if (adminsResponse.data.success) {
        setAdmins(adminsResponse.data.data);
      }

      if (configResponse.data.success) {
        setConfig(configResponse.data.data);
        setConfigData(configResponse.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    try {
      const response = await adminApi.createAdmin(newAdmin);
      if (response.data.success) {
        toast.success('Admin created successfully');
        setShowCreateModal(false);
        setNewAdmin({
          email: '',
          name: '',
          password: ''
        });
        fetchData();
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.response?.data?.message || 'Failed to create admin');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    if (admin.role === 'super_admin') {
      toast.error('Cannot delete super admin');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to deactivate admin account!`
    );

    if (!confirmed) return;

    try {
      setActionLoading(prev => ({ ...prev, delete: true }))
      // For now, we'll deactivate the admin instead of deleting
      // You can implement actual deletion in the backend if needed
      const response = await adminApi.updateAdminStatus(admin._id, {
        isActive: false
      });
      
      if (response.data.success) {
        toast.success('Admin deactivated successfully');
        fetchData();
        setEditingAdmin(null); // Close the modal
      }
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }))
    }
  };

  const handleToggleAdminStatus = async (admin: Admin) => {
    if (admin.role === 'super_admin') {
      toast.error('Cannot modify super admin status');
      return;
    }

    const action = admin.isActive ? 'deactivate' : 'activate';
    const confirmed = window.confirm(
      `Are you sure you want to ${action} admin "${admin.name}" (${admin.email})?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(prev => ({ ...prev, toggle: true }))
      const response = await adminApi.updateAdminStatus(admin._id, {
        isActive: !admin.isActive
      });
      
      if (response.data.success) {
        toast.success(`Admin ${action}d successfully`);
        fetchData();
        // Update the editing admin state
        setEditingAdmin(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      }
    } catch (error: any) {
      console.error(`Error ${action}ing admin:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} admin`);
    } finally {
      setActionLoading(prev => ({ ...prev, toggle: false }))
    }
  };

  const handleResetPassword = async (admin: Admin) => {
    if (admin.role === 'super_admin') {
      toast.error('Cannot reset super admin password');
      return;
    }

    const newPassword = prompt(
      `Enter new password for admin "${admin.name}" (${admin.email}):\n\nPassword must be at least 6 characters long.`,
      'NewPassword123!'
    );

    if (!newPassword) return;

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, resetPassword: true }))
      // You'll need to implement this endpoint in the backend
      const response = await adminApi.updateAdminStatus(admin._id, {
        password: newPassword
      });
      
      if (response.data.success) {
        toast.success('Password reset successfully');
        // Optionally close the modal
        // setEditingAdmin(null);
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setActionLoading(prev => ({ ...prev, resetPassword: false }))
    }
  };

  // Permissions are now static, no need to update them

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const response = await adminApi.updateSuperAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.data.success) {
        toast.success('Password updated successfully');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminApi.updateSuperAdminConfig(configData);
      if (response.data.success) {
        toast.success('Configuration updated successfully');
        setShowConfigModal(false);
        fetchData();
      }
    } catch (error: any) {
      console.error('Error updating config:', error);
      toast.error(error.response?.data?.message || 'Failed to update configuration');
    }
  };

  // Permissions are now static, no need to toggle them

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-var(--primary)"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
			<LoadingOverlay isVisible={isCreatingAdmin} />
      {/* Header */}
      <div className="flex justify-end items-center">
        {user?.role === 'super_admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Admin
          </button>
        )}
      </div>

      {/* Super Admin Actions */}
      {config && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Super Admin Actions</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-outline btn-sm"
            >
              Change Password
            </button>
            <span className="text-sm text-blue-700">
              Username: <strong>{config.superAdmin.username}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-#2C2C2E px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">All Administrators</h3>
                <p className="text-sm text-white/80">{admins.length} administrator{admins.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="text-white/80 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
           <table className="table">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Administrator
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50 transition-colors duration-200">
                  {/* Administrator Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-#2C2C2E flex items-center justify-center">
                          <span className="text-black font-semibold text-sm">
                            {admin.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role & Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.role === 'super_admin' 
                          ? 'bg-gray-200 text-black' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          admin.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>

                  {/* Activity */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {admin.lastLogin ? 'Last active' : 'Never logged in'}
                      </span>
                      <span className="text-xs">
                        {admin.lastLogin 
                          ? new Date(admin.lastLogin).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'No activity'
                        }
                      </span>
                    </div>
                  </td>

                  {/* Created */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium">Created</span>
                      <span className="text-xs">
                        {new Date(admin.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {user?.role === 'super_admin' && admin.role !== 'super_admin' && (
                        <button
                          onClick={() => setEditingAdmin(admin)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C2C2E] transition-colors duration-200"
                          title="Edit Admin"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                      )}
                      {user?.role === 'super_admin' && admin.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={actionLoading.delete}
                          title="Deactivate Admin"
                        >
                          <X className="h-3 w-3 mr-1" />
                          {actionLoading.delete ? 'Deactivating...' : 'Deactivate'}
                        </button>
                      )}
                      {admin.role === 'super_admin' && (
                        <span className="text-xs text-gray-400 italic">Protected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {admins.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No administrators</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new administrator.</p>
          </div>
        )}
      </div>

      {/* Enhanced Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowCreateModal(false)}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">Create New Admin</h3>
                      <p className="text-sm text-gray-600">Add a new administrator to the system</p>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-ghost hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </button>
                </div>
                
                <form onSubmit={handleCreateAdmin} className="space-y-6">
              {/* Basic Information */}
              <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg border border-blue-200">
                <div className="card-body">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-800">Basic Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="label">
                        <span className="label-text font-semibold text-gray-700">
                          Email Address
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          className="input input-bordered w-full pl-10 focus:input-primary focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                          placeholder="admin@example.com"
                          required
                        />
                      </div>
                      {newAdmin.email && !/\S+@\S+\.\S+/.test(newAdmin.email) && (
                        <div className="text-xs text-red-500 flex items-center space-x-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Please enter a valid email address</span>
                        </div>
                      )}
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="label">
                        <span className="label-text font-semibold text-gray-700">
                          Full Name
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          className="input input-bordered w-full pl-10 focus:input-primary focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                          value={newAdmin.name}
                          onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      {newAdmin.name && newAdmin.name.length < 2 && (
                        <div className="text-xs text-red-500 flex items-center space-x-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Name must be at least 2 characters</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Password Field */}
                  <div className="space-y-2 mt-6">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-700">
                        Password
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        className="input input-bordered w-full pl-10 focus:input-primary focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        placeholder="Enter a strong password"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    {/* Password Strength Indicator */}
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          newAdmin.password.length >= 6 ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          newAdmin.password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          /[A-Z]/.test(newAdmin.password) ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          /[0-9]/.test(newAdmin.password) ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          /[^A-Za-z0-9]/.test(newAdmin.password) ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className={`flex items-center space-x-1 ${newAdmin.password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>6+ characters</span>
                          </span>
                          <span className={`flex items-center space-x-1 ${newAdmin.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>8+ characters</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`flex items-center space-x-1 ${/[A-Z]/.test(newAdmin.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Uppercase</span>
                          </span>
                          <span className={`flex items-center space-x-1 ${/[0-9]/.test(newAdmin.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Number</span>
                          </span>
                          <span className={`flex items-center space-x-1 ${/[^A-Za-z0-9]/.test(newAdmin.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Special</span>
                          </span>
                        </div>
                      </div>
                      
                      {newAdmin.password && newAdmin.password.length < 6 && (
                        <div className="text-xs text-red-500 flex items-center space-x-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Password must be at least 6 characters long</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info about admin permissions */}
              <div className="alert alert-info">
                <Shield className="h-4 w-4" />
                <div>
                  <h3 className="font-bold">Admin Permissions</h3>
                  <div className="text-xs">
                    New admins will have full permissions for users, organizers, events, and system management. 
                    Only super admin can create and manage other admins.
                  </div>
                </div>
              </div>

                    {/* Form Validation Summary */}
                    {(!newAdmin.email || !newAdmin.name || !newAdmin.password || 
                      newAdmin.password.length < 6 || 
                      !/\S+@\S+\.\S+/.test(newAdmin.email)) && (
                      <div className="alert alert-warning">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h3 className="font-bold">Please complete all required fields</h3>
                          <div className="text-xs">
                            Make sure all fields are filled correctly before creating the admin.
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button 
                        type="button" 
                        className="btn btn-ghost hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className={`btn transition-all duration-200 ${
                          (!newAdmin.email || !newAdmin.name || !newAdmin.password || 
                           newAdmin.password.length < 6 || 
                           !/\S+@\S+\.\S+/.test(newAdmin.email))
                            ? 'btn-disabled opacity-50 cursor-not-allowed'
                            : 'btn-primary hover:btn-primary-focus'
                        }`}
                        disabled={!newAdmin.email || !newAdmin.name || !newAdmin.password || 
                                newAdmin.password.length < 6 || 
                                !/\S+@\S+\.\S+/.test(newAdmin.email) ||
                                isCreatingAdmin}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Admin
                      </button>
                    </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowPasswordModal(false)}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Lock className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">Change Super Admin Password</h3>
                      <p className="text-sm text-gray-600">Update your super administrator password</p>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-ghost hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">
                    Current Password
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="input input-bordered w-full pl-10 focus:input-primary focus:ring-2 focus:ring-red-500 transition-all duration-200"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">
                    New Password
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="input input-bordered w-full pl-10 focus:input-primary focus:ring-2 focus:ring-red-500 transition-all duration-200"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                  />
                </div>
                {passwordData.newPassword && passwordData.newPassword.length < 6 && (
                  <div className="text-xs text-red-500 flex items-center space-x-1">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Password must be at least 6 characters long</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">
                    Confirm New Password
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="input input-bordered w-full pl-10 focus:input-primary focus:ring-2 focus:ring-red-500 transition-all duration-200"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                  />
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <div className="text-xs text-red-500 flex items-center space-x-1">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Passwords do not match</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  className="btn btn-ghost hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary hover:btn-primary-focus transition-all duration-200"
                >
                  Update Password
                </button>
              </div>
            </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfigModal && config && (
        <div className="modal modal-open">
          <div 
            className="modal-backdrop bg-black bg-opacity-50"
            onClick={() => setShowConfigModal(false)}
          ></div>
          <div 
            className="modal-box max-w-2xl relative z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-4">Super Admin Configuration</h3>
            <form onSubmit={handleUpdateConfig} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={configData.superAdmin?.username || ''}
                    onChange={(e) => setConfigData({
                      ...configData,
                      superAdmin: { 
                        username: e.target.value,
                        email: configData.superAdmin?.email || '',
                        name: configData.superAdmin?.name || ''
                      }
                    })}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    value={configData.superAdmin?.email || ''}
                    onChange={(e) => setConfigData({
                      ...configData,
                      superAdmin: { 
                        username: configData.superAdmin?.username || '',
                        email: e.target.value,
                        name: configData.superAdmin?.name || ''
                      }
                    })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={configData.superAdmin?.name || ''}
                  onChange={(e) => setConfigData({
                    ...configData,
                    superAdmin: { 
                      username: configData.superAdmin?.username || '',
                      email: configData.superAdmin?.email || '',
                      name: e.target.value
                    }
                  })}
                  required
                />
              </div>
              <div className="divider">Settings</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Allow Password Change</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={configData.settings?.allowPasswordChange || false}
                      onChange={(e) => setConfigData({
                        ...configData,
                        settings: { 
                          allowPasswordChange: e.target.checked,
                          requireStrongPassword: configData.settings?.requireStrongPassword || false,
                          maxLoginAttempts: configData.settings?.maxLoginAttempts || 5,
                          lockoutDuration: configData.settings?.lockoutDuration || 30
                        }
                      })}
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Require Strong Password</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={configData.settings?.requireStrongPassword || false}
                      onChange={(e) => setConfigData({
                        ...configData,
                        settings: { 
                          allowPasswordChange: configData.settings?.allowPasswordChange || false,
                          requireStrongPassword: e.target.checked,
                          maxLoginAttempts: configData.settings?.maxLoginAttempts || 5,
                          lockoutDuration: configData.settings?.lockoutDuration || 30
                        }
                      })}
                    />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Max Login Attempts</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={configData.settings?.maxLoginAttempts || 5}
                    onChange={(e) => setConfigData({
                      ...configData,
                      settings: { 
                        allowPasswordChange: configData.settings?.allowPasswordChange || false,
                        requireStrongPassword: configData.settings?.requireStrongPassword || false,
                        maxLoginAttempts: parseInt(e.target.value),
                        lockoutDuration: configData.settings?.lockoutDuration || 30
                      }
                    })}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Lockout Duration (minutes)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={configData.settings?.lockoutDuration || 30}
                    onChange={(e) => setConfigData({
                      ...configData,
                      settings: { 
                        allowPasswordChange: configData.settings?.allowPasswordChange || false,
                        requireStrongPassword: configData.settings?.requireStrongPassword || false,
                        maxLoginAttempts: configData.settings?.maxLoginAttempts || 5,
                        lockoutDuration: parseInt(e.target.value)
                      }
                    })}
                    min="1"
                    max="1440"
                  />
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowConfigModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Admin Management Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setEditingAdmin(null)}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Manage Admin: {editingAdmin.name}</h3>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setEditingAdmin(null)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </button>
                </div>
            
            {/* Admin Info Card */}
            <div className="card bg-base-100 shadow-sm border mb-6">
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Email</span>
                    </label>
                    <div className="text-sm text-gray-600">{editingAdmin.email}</div>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Role</span>
                    </label>
                    <span className={`badge ${editingAdmin.role === 'super_admin' ? 'badge-primary' : 'badge-secondary'}`}>
                      {editingAdmin.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Status</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${editingAdmin.isActive ? 'badge-success' : 'badge-error'}`}>
                        {editingAdmin.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleToggleAdminStatus(editingAdmin)}
                        disabled={editingAdmin.role === 'super_admin' || actionLoading.toggle}
                      >
                        {actionLoading.toggle ? 'Processing...' : (editingAdmin.isActive ? 'Deactivate' : 'Activate')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Last Login</span>
                    </label>
                    <div className="text-sm text-gray-600">
                      {editingAdmin.lastLogin ? new Date(editingAdmin.lastLogin).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions Info */}
            <div className="card bg-base-100 shadow-sm border mb-6">
              <div className="card-body">
                <h4 className="font-semibold mb-4">Admin Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-green-600 mb-2">✓ Full Access To:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Users Management</li>
                      <li>• Organizers Management</li>
                      <li>• Events Management</li>
                      <li>• System Statistics</li>
                      <li>• System Settings</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-red-600 mb-2">✗ Restricted From:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Creating Other Admins</li>
                      <li>• Managing Admin Permissions</li>
                      <li>• Deleting Other Admins</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Actions */}
            <div className="mt-8 space-y-4">
             
              
              <div className="alert alert-warning">
                <Shield className="h-4 w-4" />
                <div>
                  <h3 className="font-bold">Security Actions</h3>
                  <div className="text-xs">Use these actions carefully as they affect admin access.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  className="btn btn-outline btn-warning"
                  onClick={() => handleResetPassword(editingAdmin)}
                  disabled={editingAdmin.role === 'super_admin' || actionLoading.resetPassword}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {actionLoading.resetPassword ? 'Resetting...' : 'Reset Password'}
                </button>
                
                {/* <button
                  className="btn btn-outline btn-error"
                  onClick={() => handleDeleteAdmin(editingAdmin)}
                  disabled={editingAdmin.role === 'super_admin'}
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete Admin
                </button> */}
              </div>
            </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setEditingAdmin(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setEditingAdmin(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
