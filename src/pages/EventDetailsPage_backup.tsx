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
  User,
  Ticket,
  Loader,
} from "lucide-react";
import Navigation from "../components/Navigation";
import { PaystackService, type PaystackTransaction } from "../services/paystackService";
import { EventService } from "../services/eventService";
import type { Event } from "../lib/supabase";

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Event data state
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  // Handle payment process
  const handlePayment = async (e: React.FormEvent) => {
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
    setPaymentStatus('processing');

    const transactionData: PaystackTransaction = {
      email: registrationData.email,
      amount: PaystackService.formatAmountToPesewas(event.price || 0), // Convert to pesewas
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
    };

    try {
      await PaystackService.processPayment(
        transactionData,
        async (response) => {
          // Payment successful
          console.log('Payment response:', response);
          setPaymentStatus('success');
          
          // Verify transaction
          const verification = await PaystackService.verifyTransaction(response.reference);
          if (verification.status) {
            console.log('Transaction verified successfully');
            // Here you would typically save the registration to your database
            alert(`🎉 Payment successful! Welcome to ${event.title}, ${registrationData.name}!`);
          } else {
            console.error('Transaction verification failed');
            setPaymentStatus('failed');
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 text-gray-900 relative overflow-x-hidden font-['Inter']">
      <Navigation />
      <div className="pt-32 pb-20 px-4 flex flex-col items-center min-h-screen">
        {/* Event Card */}
        <div className="w-full max-w-6xl bg-white/80 rounded-3xl shadow-2xl border border-purple-200 backdrop-blur-2xl p-0 overflow-hidden animate-fade-in-up mx-auto">
          {/* Event Image */}
          <div className="relative h-72 md:h-[420px] w-full overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-xl shadow text-purple-700 font-bold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {event.date}
            </div>            <div className="absolute top-4 right-4 bg-purple-600/90 text-white px-4 py-2 rounded-xl shadow text-sm font-bold flex items-center gap-2">
              <Ticket className="w-4 h-4" />{" "}
              {event.isFree ? "FREE" : `₵${event.price}`}
            </div>
          </div>
          {/* Event Details */}
          <div className="p-8 md:p-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-purple-900 mb-4 font-['Montserrat']">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 mb-6 text-lg">
              <div className="flex items-center gap-2 text-purple-700">
                <Clock className="w-5 h-5" /> {event.time}
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <MapPin className="w-5 h-5" /> {event.location}
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <Users className="w-5 h-5" /> {event.attendees} /{" "}
                {event.maxAttendees} attending
              </div>
              <div className="flex items-center gap-2 text-yellow-500">
                <Star className="w-5 h-5 fill-current" /> {event.rating}
              </div>
            </div>
            <p className="text-xl text-gray-700 mb-8">{event.description}</p>
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/hellosnippet_transparent.png"
                alt="Organizer"
                className="w-10 h-10 rounded-full border-2 border-purple-300"
              />
              <span className="text-purple-800 font-semibold">
                Organized by {event.organizer}
              </span>
            </div>
            {/* Registration/Join Panel */}
            {event.isRegistrationOpen ? (              <div className="bg-white/90 border border-purple-200 rounded-2xl shadow-xl p-8 flex flex-col gap-6 items-center max-w-lg mx-auto">
                {/* Demo Notice */}                <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
                    <AlertCircle className="w-5 h-5" />
                    Paystack Test Mode
                  </div>
                  <p className="text-blue-700 text-sm mb-2">
                    This is using Paystack's test environment. No real money will be charged.
                  </p>
                  <div className="text-blue-600 text-xs">
                    <strong>Test Cards:</strong><br/>
                    • Mastercard: 5531 8866 5214 2950 (CVV: 564, PIN: 3310)<br/>
                    • Visa: 4084 0840 8408 4081 (CVV: 408, PIN: 0000)<br/>
                    • Verve: 5061 0201 0000 0000 004 (CVV: 123, PIN: 1111)
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-purple-800 mb-2">
                  Register for this Event
                </h2><form onSubmit={handlePayment} className="w-full flex flex-col gap-4">
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
                  {!event.isFree && (
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
                  
                  {/* Payment Status Indicator */}
                  {paymentStatus === 'processing' && (
                    <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                      <Loader className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-blue-700 font-medium">Processing payment...</span>
                    </div>
                  )}
                  
                  {paymentStatus === 'success' && (
                    <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-700 font-medium">Payment successful! 🎉</span>
                    </div>
                  )}
                  
                  {paymentStatus === 'failed' && (
                    <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-700 font-medium">Payment failed. Please try again.</span>
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
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : paymentStatus === 'success' ? (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Registration Complete!
                      </>                    ) : (
                      <>
                        <CreditCard className="w-6 h-6" />
                        {event.isFree ? 'Register Now' : `Pay ₵${event.price} - Register Now`}
                      </>
                    )}
                  </button>
                </form>                <div className="flex flex-col md:flex-row gap-4 mt-6 w-full items-center justify-between text-sm">
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
                <Users className="w-5 h-5" /> {event.attendees} people already
                registered
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
    </div>
  );
};

export default EventDetailsPage;
