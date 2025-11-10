import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  UserCheck,
  Send,
  Calendar
} from 'lucide-react';
import type { Organizer } from '../../lib/supabase';
import { EventService } from '../../services/eventService';
import { RegistrationService } from '../../services/registrationService';
import type { EventRegistration } from '../../services/registrationService';
import { useTheme } from '../../contexts/ThemeContext';

interface AttendeesProps {
  organizer: Organizer | null;
}

interface EventWithRegistrations {
  id: string;
  title: string;
  registrationCount: number;
}

const Attendees: React.FC<AttendeesProps> = ({ organizer }) => {
  const { currencySymbol } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [events, setEvents] = useState<EventWithRegistrations[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (organizer?.id) {
      loadData();
    }
  }, [organizer?.id]);

  const loadData = async () => {
    if (!organizer?.id) return;

    try {
      setLoading(true);

      const eventsResult = await EventService.getOrganizerEvents(organizer.id);

      if (eventsResult.success && eventsResult.events) {
        const eventsWithCount = await Promise.all(
          eventsResult.events.map(async (event) => {
            const countResult = await RegistrationService.getEventRegistrationCount(event.id);
            return {
              id: event.id,
              title: event.title,
              registrationCount: countResult.count || 0
            };
          })
        );

        setEvents(eventsWithCount);

        if (eventsWithCount.length > 0) {
          const allRegistrations: EventRegistration[] = [];

          for (const event of eventsResult.events) {
            const regResult = await RegistrationService.getEventRegistrations(event.id);
            if (regResult.success && regResult.registrations) {
              const regsWithEventName = regResult.registrations.map(reg => ({
                ...reg,
                eventTitle: event.title
              }));
              allRegistrations.push(...regsWithEventName as any);
            }
          }

          setRegistrations(allRegistrations);
        }
      }
    } catch (error) {
      console.error('Error loading attendees data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = registrations.filter(reg => {
    const matchesSearch = (reg.attendee_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         reg.attendee_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEvent = eventFilter === 'all' || reg.event_id === eventFilter;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'checked-in' && reg.check_in_time) ||
                         (statusFilter === 'not-checked-in' && !reg.check_in_time);
    return matchesSearch && matchesEvent && matchesStatus;
  });

  const handleSelectAttendee = (id: string) => {
    setSelectedAttendees(prev =>
      prev.includes(id)
        ? prev.filter(attendeeId => attendeeId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAttendees.length === filteredAttendees.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(filteredAttendees.map(a => a.id));
    }
  };

  const handleCheckIn = async (registrationId: string) => {
    try {
      setUpdating(true);

      const { error } = await EventService.supabase
        .from('event_registrations')
        .update({
          check_in_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationId);

      if (error) {
        console.error('Check-in error:', error);
        alert('Failed to check in attendee');
        return;
      }

      await loadData();
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to check in attendee');
    } finally {
      setUpdating(false);
    }
  };

  const handleResendTicket = (id: string) => {
    console.log('Resend ticket to attendee:', id);
    alert('Email functionality will be implemented soon');
  };

  const stats = {
    total: registrations.length,
    checkedIn: registrations.filter(r => r.check_in_time).length,
    notCheckedIn: registrations.filter(r => !r.check_in_time).length,
    totalRevenue: registrations
      .filter(r => r.payment_status === 'completed')
      .reduce((sum, r) => sum + (r.amount_paid || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendees</h1>
          <p className="text-gray-600 mt-1">Manage and track your event attendees</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
            <Mail className="h-4 w-4" />
            <span>Send Email</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Attendees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Checked In</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.checkedIn}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Not Checked In</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.notCheckedIn}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{currencySymbol}{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
              <Download className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search attendees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Event Filter */}
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Events ({registrations.length})</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} ({event.registrationCount})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="not-checked-in">Not Checked In</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAttendees.length > 0 && (
          <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">
                {selectedAttendees.length} attendee(s) selected
              </span>
              <div className="flex space-x-2">
                <button className="text-sm bg-primary-500 text-white px-3 py-1 rounded-lg hover:bg-primary-600 transition-colors">
                  Check In All
                </button>
                <button className="text-sm bg-white border border-primary-300 text-primary-700 px-3 py-1 rounded-lg hover:bg-primary-50 transition-colors">
                  Send Email
                </button>
                <button className="text-sm bg-white border border-primary-300 text-primary-700 px-3 py-1 rounded-lg hover:bg-primary-50 transition-colors">
                  Export Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedAttendees.includes(reg.id)}
                      onChange={() => handleSelectAttendee(reg.id)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{reg.attendee_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{reg.attendee_email}</div>
                      {reg.attendee_phone && (
                        <div className="text-sm text-gray-400">{reg.attendee_phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{(reg as any).eventTitle}</div>
                    <div className="text-sm text-gray-500">Registered: {new Date(reg.registration_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      reg.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                      reg.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      reg.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {reg.payment_status === 'completed' ? 'Paid' :
                       reg.payment_status === 'pending' ? 'Pending' :
                       reg.payment_status === 'failed' ? 'Failed' : reg.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {reg.check_in_time ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className={`text-sm ${reg.check_in_time ? 'text-green-600' : 'text-gray-500'}`}>
                        {reg.check_in_time ? 'Checked In' : 'Not Checked In'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(reg.amount_paid || 0) === 0 ? 'Free' : `${currencySymbol}${(reg.amount_paid || 0).toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!reg.check_in_time && (
                        <button
                          onClick={() => handleCheckIn(reg.id)}
                          disabled={updating}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Check In"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleResendTicket(reg.id)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Resend Ticket"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAttendees.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No attendees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || eventFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Attendees will appear here once people register for your events.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Attendees;