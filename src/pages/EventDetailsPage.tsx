import React from "react";
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
} from "lucide-react";
import Navigation from "../components/Navigation";

// Example event data (replace with real data fetching logic)
const event = {
  title: "Fire Camp 2025",
  date: "August 15, 2026",
  time: "9:00 AM - 6:00 PM",
  location: "To Be Determined, Accra, Ghana",
  image:
    "https://i.ibb.co/PGG5x6kk/image-1.webp",
  description:
    "Join us for an unforgettable day of worship, learning, and connection at Fire Camp 2025! Experience inspiring speakers, live music, and a vibrant community.",
  organizer: "Kingdom Christian Fellowship",
  attendees: 2500,
  maxAttendees: 3000,
  price: 100,
  rating: 4.9,
  isFree: false,
  isLive: false,
  isRegistrationOpen: true,
};

const EventDetailsPage = () => {
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
            </div>
            <div className="absolute top-4 right-4 bg-purple-600/90 text-white px-4 py-2 rounded-xl shadow text-sm font-bold flex items-center gap-2">
              <Ticket className="w-4 h-4" />{" "}
              {event.isFree ? "FREE" : `$${event.price}`}
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
            {event.isRegistrationOpen ? (
              <div className="bg-white/90 border border-purple-200 rounded-2xl shadow-xl p-8 flex flex-col gap-6 items-center max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-purple-800 mb-2">
                  Register for this Event
                </h2>
                <form className="w-full flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-purple-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors"
                        placeholder="Your Name"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-purple-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors"
                        placeholder="you@email.com"
                        required
                      />
                    </div>
                  </div>
                  {!event.isFree && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-purple-700 mb-1">
                        Payment
                      </label>
                      <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                        <CreditCard className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-purple-700">
                          Card payment (Stripe/Paystack)
                        </span>
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="mt-4 w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-4 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-6 h-6" /> Register Now
                  </button>
                </form>
                <div className="flex flex-col md:flex-row gap-4 mt-6 w-full items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <ShieldCheck className="w-5 h-5" /> Secure checkout
                  </div>
                  <div className="flex items-center gap-2 text-purple-600 font-medium">
                    <Lock className="w-5 h-5" /> No hidden fees
                  </div>
                  <div className="flex items-center gap-2 text-purple-600 font-medium">
                    <AlertCircle className="w-5 h-5" /> Refunds available
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
