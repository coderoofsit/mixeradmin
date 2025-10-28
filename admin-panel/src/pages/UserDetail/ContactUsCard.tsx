import React, { useState, useEffect } from 'react';
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'badge-warning';
      case 'contacted':
        return 'badge-info';
      case 'resolved':
        return 'badge-success';
      case 'archived':
        return 'badge-secondary';
      default:
        return 'badge-secondary';
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
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-var(--text-primary) flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-var(--primary)" />
          Contact Us Submission
        </h2>
        <span className={`badge ${getStatusBadge(contact.status)}`}>
          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-var(--text-muted) uppercase tracking-wider">
            Personal Information
          </h3>
          
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-var(--text-muted) mt-0.5" />
            <div>
              <p className="text-xs text-var(--text-muted)">Full Name</p>
              <p className="text-sm font-medium text-var(--text-primary)">
                {contact.firstName} {contact.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-var(--text-muted) mt-0.5" />
            <div>
              <p className="text-xs text-var(--text-muted)">Gender</p>
              <p className="text-sm font-medium text-var(--text-primary)">
                {contact.gender}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-var(--text-muted) mt-0.5" />
            <div>
              <p className="text-xs text-var(--text-muted)">Date of Birth</p>
              <p className="text-sm font-medium text-var(--text-primary)">
                {new Date(contact.dateOfBirth).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                <span className="text-xs text-var(--text-muted) ml-2">
                  ({formatAge(contact.dateOfBirth)} years old)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-var(--text-muted) uppercase tracking-wider">
            Contact Information
          </h3>
          
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-var(--text-muted) mt-0.5" />
            <div>
              <p className="text-xs text-var(--text-muted)">Email</p>
              <a 
                href={`mailto:${contact.email}`}
                className="text-sm font-medium text-var(--primary) hover:underline"
              >
                {contact.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-var(--text-muted) mt-0.5" />
            <div>
              <p className="text-xs text-var(--text-muted)">Phone</p>
              <a 
                href={`tel:${contact.countryCode}${contact.phone}`}
                className="text-sm font-medium text-var(--primary) hover:underline"
              >
                {contact.countryCode} {contact.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-var(--text-muted) mt-0.5" />
            <div>
              <p className="text-xs text-var(--text-muted)">Location</p>
              <p className="text-sm font-medium text-var(--text-primary)">
                {contact.location}
              </p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-var(--text-muted) uppercase tracking-wider">
            Submission Details
          </h3>
          
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-var(--text-muted) mt-0.5" />
            <div>
              <p className="text-xs text-var(--text-muted)">Submitted At</p>
              <p className="text-sm font-medium text-var(--text-primary)">
                {formatDate(contact.submittedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-var(--text-muted) mt-0.5" />
            <div>
              <p className="text-xs text-var(--text-muted)">Last Updated</p>
              <p className="text-sm font-medium text-var(--text-primary)">
                {formatDate(contact.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Section */}
      {contact.message && (
        <div className="mt-6 pt-6 border-t border-var(--border)">
          <h3 className="text-xs font-semibold text-var(--text-muted) uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Message
          </h3>
          <div className="bg-var(--bg-tertiary) rounded-lg p-4">
            <p className="text-var(--text-primary) whitespace-pre-wrap">
              {contact.message}
            </p>
          </div>
        </div>
      )}

      {/* Admin Actions Section */}
      <div className="mt-6 pt-6 border-t border-var(--border)">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-var(--text-muted) uppercase tracking-wider">
            Admin Actions
          </h3>
          <button
            onClick={() => setConfirmationModal({ isOpen: true, loading: false })}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-var(--error) hover:bg-var(--error)/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Contact
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Update */}
          <div>
            <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
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
              className="btn btn-primary flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
            Admin Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Add notes about this contact..."
            className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) placeholder-var(--text-muted) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
            disabled={updating}
          />
          <p className="text-xs text-var(--text-muted) mt-1">
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
        type="danger"
      />
    </div>
  );
};

export default ContactUsCard;

