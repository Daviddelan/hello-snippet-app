import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  Clock,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Lock,
  Mail,
  Ticket,
  Loader,
} from "lucide-react";
import Navigation from "../components/Navigation";
import { PaystackService, type PaystackTransaction } from "../services/paystackService";
import { EventService } from "../services/eventService";
import { RegistrationService } from "../services/registrationService";
import type { Event } from "../lib/supabase";

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
    // Event data state
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationCount, setRegistrationCount] = useState<number>(0);
  
  // Payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: ''
  });
  // Load event data on component mount
  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError('Event ID not provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await EventService.getEventById(id);
        
        if (result.success && result.event) {
          setEvent(result.event);
          setError(null);

          // Load registration count
          const registrationResult = await RegistrationService.getEventRegistrationCount(id);
          if (registrationResult.success) {
            setRegistrationCount(registrationResult.count || 0);
          }
        } else {
          setError(result.error || 'Event not found');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Failed to load event data');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // Handle registration (payment or free)
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) {
      alert('Event data not available');
      return;
    }
    
    if (!registrationData.name || !registrationData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus('processing');    // Check if event is free
    if (isEventFree(event.price)) {
      // Handle free event registration
      try {
        console.log('Creating free event registration...');
        
        const registrationResult = await RegistrationService.createRegistration({
          event_id: event.id,
          attendee_email: registrationData.email.toLowerCase(),
          attendee_name: registrationData.name,
          payment_status: 'completed', // Free events are automatically completed
          amount_paid: 0,
          currency: 'GHS',
          status: 'confirmed',
          ticket_type: 'free'
        });

        if (registrationResult.success) {
          setPaymentStatus('success');
          setIsProcessingPayment(false);
          
          // Update registration count
          const updatedCount = await RegistrationService.getEventRegistrationCount(event.id);
          if (updatedCount.success) {
            setRegistrationCount(updatedCount.count || 0);
          }
          
          alert(`🎉 Registration successful! Welcome to ${event.title}, ${registrationData.name}!`);
        } else {
          throw new Error(registrationResult.error || 'Registration failed');
        }
        
      } catch (error) {
        console.error('Registration error:', error);
        setPaymentStatus('failed');
        setIsProcessingPayment(false);
        alert('Registration failed. Please try again.');
      }
      
      return;
    }

    // Handle paid event registration with Paystack
    const transactionData: PaystackTransaction = {
      email: registrationData.email,
      amount: PaystackService.formatAmountToPesewas(event.price), // Convert to pesewas
      currency: 'GHS',
      reference: PaystackService.generateReference('EVT'),
      metadata: {
        event_id: event.id,
        event_title: event.title,
        attendee_name: registrationData.name,
        custom_fields: [
          {
            display_name: 'Event',
            variable_name: 'event',
            value: event.title
          },
          {
            display_name: 'Attendee',
            variable_name: 'attendee',
            value: registrationData.name
          }
        ]
      }
    };    try {
      await PaystackService.processPayment(
        transactionData,
        async (response) => {
          // Payment successful - create registration record
          console.log('Payment response:', response);
          
          try {
            const registrationResult = await RegistrationService.createRegistration({
              event_id: event.id,
              attendee_email: registrationData.email.toLowerCase(),
              attendee_name: registrationData.name,
              payment_status: 'completed',
              payment_reference: response.reference,
              amount_paid: event.price,
              currency: 'GHS',
              status: 'confirmed',
              ticket_type: 'paid',
              metadata: {
                paystack_response: response
              }
            });

            if (registrationResult.success) {
              setPaymentStatus('success');
              
              // Update registration count
              const updatedCount = await RegistrationService.getEventRegistrationCount(event.id);
              if (updatedCount.success) {
                setRegistrationCount(updatedCount.count || 0);
              }
              
              alert(`🎉 Payment successful! Welcome to ${event.title}, ${registrationData.name}!`);
            } else {
              throw new Error(registrationResult.error || 'Failed to create registration record');
            }
          } catch (registrationError) {
            console.error('Registration creation error:', registrationError);
            alert('Payment successful but registration record creation failed. Please contact support.');
          }
          
          setIsProcessingPayment(false);
        },
        () => {
          // Payment cancelled or failed
          setPaymentStatus('idle');
          setIsProcessingPayment(false);
        }
      );
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setIsProcessingPayment(false);
      alert('Payment failed. Please try again.');
    }
  };

  // Helper functions for data formatting
  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEventTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })} - ${end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  };

  const isEventFree = (price: number) => price === 0;
  const isRegistrationOpen = (event: Event) => event.is_published && event.status === 'published';

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 flex items-center justify-center">
        <Navigation />
        <div className="text-center pt-32">
          <Loader className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 flex items-center justify-center">
        <Navigation />
        <div className="text-center pt-32 max-w-lg mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The event you are looking for does not exist or has been removed.'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 text-gray-900 relative overflow-x-hidden font-['Inter']">
      <Navigation />
      <div className="pt-32 pb-20 px-4 flex flex-col items-center min-h-screen">
        {/* Event Card */}
        <div className="w-full max-w-6xl bg-white/80 rounded-3xl shadow-2xl border border-purple-200 backdrop-blur-2xl p-0 overflow-hidden animate-fade-in-up mx-auto">
          {/* Event Image */}
          <div className="relative h-72 md:h-[420px] w-full overflow-hidden">
            <img
              src={event.image_url || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1600'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-xl shadow text-purple-700 font-bold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {formatEventDate(event.start_date)}
            </div>
            <div className="absolute top-4 right-4 bg-purple-600/90 text-white px-4 py-2 rounded-xl shadow text-sm font-bold flex items-center gap-2">
              <Ticket className="w-4 h-4" />{" "}
              {isEventFree(event.price) ? "FREE" : `₵${event.price}`}
            </div>
          </div>
          
          {/* Event Details */}
          <div className="p-8 md:p-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-purple-900 mb-4 font-['Montserrat']">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 mb-6 text-lg">
              <div className="flex items-center gap-2 text-purple-700">
                <Clock className="w-5 h-5" /> {formatEventTime(event.start_date, event.end_date)}
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <MapPin className="w-5 h-5" /> {event.location}
              </div>              <div className="flex items-center gap-2 text-purple-700">
                <Users className="w-5 h-5" /> {registrationCount} registered / {event.capacity} capacity
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <Star className="w-5 h-5 text-yellow-500" /> {event.category}
              </div>
            </div>
            
            {event.description && (
              <p className="text-xl text-gray-700 mb-8">{event.description}</p>
            )}
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg border-2 border-purple-300 overflow-hidden">
                {event.organizers?.logo_url ? (
                  <img
                    src={event.organizers.logo_url}
                    alt={event.organizers?.organization_name || 'Organizer'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallbackText = (event.organizers?.organization_name || event.organizers?.first_name || 'O').charAt(0).toUpperCase();
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-lg font-bold">${fallbackText}</span>`;
                    }}
                  />
                ) : (
                  (event.organizers?.organization_name || event.organizers?.first_name || 'O').charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-purple-800 font-semibold">
                Organized by {event.organizers?.organization_name || `${event.organizers?.first_name || ''} ${event.organizers?.last_name || ''}`.trim() || 'HelloSnippet Partner'}
              </span>
            </div>
            
            {/* Registration/Join Panel */}            {isRegistrationOpen(event) ? (
              <div className="bg-white/90 border border-purple-200 rounded-2xl shadow-xl p-8 flex flex-col gap-6 items-center max-w-lg mx-auto">
                {/* Live Payment Notice */}
                <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                    <ShieldCheck className="w-5 h-5" />
                    Secure Live Payment
                  </div>
                  <p className="text-green-700 text-sm mb-2">
                    This is a live payment system. Real money will be charged to your card.
                  </p>
                  <div className="text-green-600 text-xs">
                    <strong>Accepted:</strong> Visa, Mastercard, Verve, Bank Transfer, Mobile Money & USSD
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-purple-800 mb-2">
                  Register for this Event
                </h2>

                <form onSubmit={handleRegistration} className="w-full flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-purple-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={registrationData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors"
                        placeholder="Your Name"
                        required
                        disabled={isProcessingPayment}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-purple-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={registrationData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors"
                        placeholder="you@email.com"
                        required
                        disabled={isProcessingPayment}
                      />
                    </div>
                  </div>
                  {!isEventFree(event.price) && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-purple-700 mb-1">
                        Payment Method
                      </label>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl px-4 py-3">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-700">
                          Paystack - Card, Bank Transfer, USSD
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span>Secure payment powered by Paystack</span>
                      </div>
                    </div>
                  )}
                    {/* Registration Status Indicator */}
                  {paymentStatus === 'processing' && (
                    <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                      <Loader className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-blue-700 font-medium">
                        {isEventFree(event.price) ? 'Processing registration...' : 'Processing payment...'}
                      </span>
                    </div>
                  )}
                  
                  {paymentStatus === 'success' && (
                    <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-700 font-medium">
                        {isEventFree(event.price) ? 'Registration successful! 🎉' : 'Payment successful! 🎉'}
                      </span>
                    </div>
                  )}
                  
                  {paymentStatus === 'failed' && (
                    <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-700 font-medium">
                        {isEventFree(event.price) ? 'Registration failed. Please try again.' : 'Payment failed. Please try again.'}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessingPayment || paymentStatus === 'success'}
                    className={`mt-4 w-full py-4 rounded-2xl font-bold text-xl shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                      isProcessingPayment 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : paymentStatus === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:scale-105 hover:shadow-2xl'
                    }`}
                  >                    {isProcessingPayment ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        {isEventFree(event.price) ? 'Registering...' : 'Processing...'}
                      </>
                    ) : paymentStatus === 'success' ? (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Registration Complete!
                      </>
                    ) : (                      <>
                        {isEventFree(event.price) ? (
                          <Users className="w-6 h-6" />
                        ) : (
                          <CreditCard className="w-6 h-6" />
                        )}
                        {isEventFree(event.price) ? 'Register Now' : `Pay ₵${event.price} - Register Now`}
                      </>
                    )}
                  </button>
                </form>
                
                <div className="flex flex-col md:flex-row gap-4 mt-6 w-full items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <ShieldCheck className="w-4 h-4" /> Paystack Secure
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <CreditCard className="w-4 h-4" /> Cards, Transfer, USSD
                  </div>
                  <div className="flex items-center gap-2 text-purple-600 font-medium">
                    <Lock className="w-4 h-4" /> 256-bit SSL
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-xl p-8 flex flex-col gap-4 items-center max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-yellow-800 mb-2">
                  Registration Closed
                </h2>
                <p className="text-yellow-700">
                  Registration for this event is currently closed. Please check
                  back later or contact the organizer for more info.
                </p>
              </div>
            )}
            
            {/* Social Proof & Support */}
            <div className="flex flex-col md:flex-row gap-6 mt-10 items-center justify-between">
              <div className="flex items-center gap-2 text-purple-700 font-medium">
                <Users className="w-5 h-5" /> Capacity: {event.capacity} people
              </div>
              <div className="flex items-center gap-2 text-purple-700 font-medium">
                <Mail className="w-5 h-5" /> Need help?{" "}
                <a
                  href="mailto:support@hellosnippet.com"
                  className="underline hover:text-purple-900"
                >
                  Contact us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
};

export default EventDetailsPage;
