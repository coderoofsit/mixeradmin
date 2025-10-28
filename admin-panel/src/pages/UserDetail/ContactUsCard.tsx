import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, User, MessageSquare, FileText, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

interface ContactUsCardProps {
  contact: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
    location: string;
    dateOfBirth: string;
    gender: string;
    message: string;
    status: string;
    notes: string;
    submittedAt: string;
    updatedAt: string;
    createdAt: string;
  };
  onUpdate?: () => void;
}

const ContactUsCard: React.FC<ContactUsCardProps> = ({ contact, onUpdate }) => {
  const [status, setStatus] = useState(contact.status);
  const [notes, setNotes] = useState(contact.notes || '');
  const [updating, setUpdating] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    loading: false
  });

  useEffect(() => {
    setStatus(contact.status);
    setNotes(contact.notes || '');
  }, [contact]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAge = (dateString: string) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const updates: { status?: string; notes?: string } = {};
      if (status !== contact.status) updates.status = status;
      if (notes !== contact.notes) updates.notes = notes;
      
      if (Object.keys(updates).length > 0) {
        await adminApi.updateContact(contact._id, updates);
        toast.success('Contact updated successfully');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setConfirmationModal({ ...confirmationModal, loading: true });
      await adminApi.deleteContact(contact._id);
      toast.success('Contact deleted successfully');
      if (onUpdate) onUpdate();
      setConfirmationModal({ isOpen: false, loading: false });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
      setConfirmationModal({ ...confirmationModal, loading: false });
    }
  };

  const hasChanges = status !== contact.status || notes !== (contact.notes || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Contact Us Submission
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contact.status)}`}>
          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Personal Information
          </h3>
          
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {contact.firstName} {contact.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {contact.gender}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {new Date(contact.dateOfBirth).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  ({formatAge(contact.dateOfBirth)} years old)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Contact Information
          </h3>
          
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <a 
                href={`mailto:${contact.email}`}
                className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {contact.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <a 
                href={`tel:${contact.countryCode}${contact.phone}`}
                className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {contact.countryCode} {contact.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {contact.location}
              </p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Submission Details
          </h3>
          
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Submitted At</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {formatDate(contact.submittedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {formatDate(contact.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Section */}
      {contact.message && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Message
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {contact.message}
            </p>
          </div>
        </div>
      )}

      {/* Admin Actions Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Admin Actions
          </h3>
          <button
            onClick={() => setConfirmationModal({ isOpen: true, loading: false })}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Contact
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Update */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={updating}
            >
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-3">
            <button
              onClick={handleUpdate}
              disabled={!hasChanges || updating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Admin Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Add notes about this contact..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            disabled={updating}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {notes.length}/1000 characters
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        loading={confirmationModal.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmationModal({ isOpen: false, loading: false })}
        title="Delete Contact"
        message="Are you sure you want to delete this contact? This action cannot be undone."
        confirmText="Delete"
        confirmButtonClass="btn-danger"
      />
    </motion.div>
  );
};

export default ContactUsCard;

