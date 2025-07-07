import React from "react";
import Navigation from "../components/Navigation";
import {
  Sparkles,
  Users,
  Heart,
  Globe2,
  Star,
  Smile,
  Rocket,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-white to-purple-200 relative flex flex-col">
      <Navigation />
      {/* Animated background blobs */}
      <svg
        className="absolute top-[-120px] left-[-120px] w-[600px] h-[600px] z-0 animate-float-slow"
        viewBox="0 0 600 600"
        fill="none"
      >
        <ellipse
          cx="300"
          cy="300"
          rx="300"
          ry="300"
          fill="#c4b5fd"
          fillOpacity="0.18"
        />
      </svg>
      <svg
        className="absolute bottom-[-180px] right-[-180px] w-[700px] h-[700px] z-0 animate-float-slow2"
        viewBox="0 0 700 700"
        fill="none"
      >
        <ellipse
          cx="350"
          cy="350"
          rx="350"
          ry="350"
          fill="#a78bfa"
          fillOpacity="0.13"
        />
      </svg>
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center w-full px-2 md:px-0 py-10 md:py-20">
        <div className="w-full max-w-5xl bg-white/80 rounded-3xl shadow-2xl border border-purple-200 backdrop-blur-2xl p-6 md:p-16 flex flex-col md:flex-row gap-12 animate-fade-in-up">
          {/* Left: About content */}
          <div className="flex-1 flex flex-col justify-center items-start gap-8">
            <div className="flex items-center gap-4 mb-2">
              <Sparkles className="text-purple-600" size={44} />
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-purple-700 to-purple-900 font-['Montserrat'] drop-shadow-2xl leading-tight">
                About Hello Snippet
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-700 font-['Inter'] max-w-2xl mb-2">
              Hello Snippet is a modern event platform built to empower
              communities, organizers, and attendees. We believe in making event
              planning and ticketing simple, secure, and delightful for
              everyone.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="flex flex-col items-start gap-2">
                <Users className="text-purple-500" size={28} />
                <h3 className="font-bold text-lg text-purple-800">
                  For Everyone
                </h3>
                <p className="text-gray-700">
                  From festivals to workshops, Hello Snippet is for all events
                  and communities.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Heart className="text-pink-500" size={28} />
                <h3 className="font-bold text-lg text-purple-800">
                  Built with Care
                </h3>
                <p className="text-gray-700">
                  We care deeply about user experience, privacy, and making
                  every interaction special.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Globe2 className="text-blue-500" size={28} />
                <h3 className="font-bold text-lg text-purple-800">
                  Global Reach
                </h3>
                <p className="text-gray-700">
                  Connecting people and ideas across the world, making events
                  accessible for all.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Star className="text-yellow-400" size={28} />
                <h3 className="font-bold text-lg text-purple-800">
                  Trusted & Loved
                </h3>
                <p className="text-gray-700">
                  Thousands trust Hello Snippet for their most important moments
                  and memories.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 mt-4">
              <Smile className="text-purple-400" size={32} />
              <p className="text-base md:text-lg text-gray-700 max-w-xl">
                Our mission is to bring people together, spark joy, and make
                every event a success. Thank you for being part of our journey!
              </p>
              <Rocket className="text-purple-600" size={32} />
            </div>
          </div>
          {/* Right: Contact & Info */}
          <div className="flex-1 flex flex-col justify-center items-center gap-8 bg-white/70 rounded-2xl shadow-xl border border-purple-100 p-8 md:p-10 backdrop-blur-xl min-w-[260px] max-w-xs mx-auto relative overflow-visible">
            {/* Animated accent blob behind card */}
            <svg
              className="absolute -top-10 -right-10 w-40 h-40 z-0 animate-float-slow2"
              viewBox="0 0 160 160"
              fill="none"
            >
              <ellipse
                cx="80"
                cy="80"
                rx="80"
                ry="80"
                fill="#a78bfa"
                fillOpacity="0.18"
              />
            </svg>
            {/* Logo at the top */}
            <img
              src="/hellosnippet_transparent.png"
              alt="HelloSnippet Logo"
              className="w-40 mb-2 drop-shadow-lg z-10"
              style={{ objectFit: "contain" }}
            />
            <h2 className="text-2xl font-bold text-purple-800 mb-1 flex items-center gap-2 z-10">
              <Mail className="text-purple-500" size={22} />
              Contact Us
            </h2>
            <p className="text-purple-600 text-center text-base font-medium z-10 -mt-2 mb-2">
              We’d love to hear from you!
            </p>
            <div className="flex flex-col gap-4 w-full z-10">
              <div className="flex items-center gap-3 text-purple-700 text-base">
                <Mail size={20} className="text-purple-400" />
                <span>support@hellosnippet.com</span>
              </div>
              <div className="flex items-center gap-3 text-purple-700 text-base">
                <Phone size={20} className="text-purple-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-purple-700 text-base">
                <MapPin size={20} className="text-purple-400" />
                <span>123 Event Lane, Accra, Ghana</span>
              </div>
            </div>
            <div className="w-full border-t border-purple-100 my-3 z-10" />
            <div className="mt-2 flex flex-col items-center gap-2 z-10">
              <span className="text-purple-700 font-semibold">Follow us:</span>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="hover:scale-110 transition-transform"
                  title="HelloSnippet"
                >
                  <img
                    src="/icon500x500.png"
                    alt="HelloSnippet"
                    className="w-8 h-8 rounded-full shadow"
                  />
                </a>
                <a
                  href="#"
                  className="hover:scale-110 transition-transform"
                  title="Twitter"
                >
                  <svg
                    width="28"
                    height="28"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="text-blue-400"
                  >
                    <path
                      d="M22 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 0 0 1.963-2.475 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 12.03 9.03c0 .352.04.695.116 1.022C8.728 9.91 5.8 8.3 3.872 5.905a4.48 4.48 0 0 0-.606 2.254c0 1.555.792 2.927 2.002 3.73a4.48 4.48 0 0 1-2.03-.56v.057a4.48 4.48 0 0 0 3.6 4.393c-.193.052-.397.08-.607.08-.148 0-.292-.014-.432-.04a4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 2 19.07a12.67 12.67 0 0 0 6.86 2.01c8.23 0 12.74-6.82 12.74-12.74 0-.194-.004-.387-.013-.578A9.1 9.1 0 0 0 24 4.59a8.98 8.98 0 0 1-2.6.713Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="hover:scale-110 transition-transform"
                  title="LinkedIn"
                >
                  <svg
                    width="28"
                    height="28"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="text-blue-700"
                  >
                    <path
                      d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5ZM7.12 20.45H3.56V9h3.56v11.45ZM5.34 7.67a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm15.11 12.78h-3.56v-5.6c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.69h-3.56V9h3.42v1.56h.05c.48-.91 1.65-1.85 3.39-1.85 3.63 0 4.3 2.39 4.3 5.5v6.24Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Meet the Team Section */}
        <section className="w-full max-w-5xl mt-16 bg-white/70 rounded-3xl shadow-xl border border-purple-100 p-8 md:p-14 backdrop-blur-xl animate-fade-in-up flex flex-col items-center gap-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-purple-700 to-purple-900 font-['Montserrat'] mb-6 flex items-center gap-3">
            <Star className="text-yellow-400" size={32} /> Meet the Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 w-full">
            {/* Team Member 1 */}
            <div className="flex flex-col items-center bg-white/90 rounded-2xl shadow-lg border border-purple-100 p-6 gap-3 hover:scale-105 transition-transform">
              <img
                src="/pic1.jpg"
                alt="Team Member"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-300 shadow mb-2"
              />
              <h3 className="font-bold text-lg text-purple-800">
                Keith Arthur
              </h3>
              <span className="text-purple-500 font-semibold">CEO</span>
              <p className="text-gray-700 text-center text-sm">
                Visionary leader passionate about building joyful, secure event
                experiences for all.
              </p>
            </div>
            {/* Team Member 2 */}
            <div className="flex flex-col items-center bg-white/90 rounded-2xl shadow-lg border border-purple-100 p-6 gap-3 hover:scale-105 transition-transform">
              <img
                src="/pic2.jpg"
                alt="Team Member"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-300 shadow mb-2"
              />
              <h3 className="font-bold text-lg text-purple-800">
                Jesse Adjetey
              </h3>
              <span className="text-purple-500 font-semibold">Designer</span>
              <p className="text-gray-700 text-center text-sm">
                Crafts beautiful, intuitive interfaces that make Hello Snippet a
                joy to use.
              </p>
            </div>
            {/* Team Member 3 */}
            <div className="flex flex-col items-center bg-white/90 rounded-2xl shadow-lg border border-purple-100 p-6 gap-3 hover:scale-105 transition-transform">
              <img
                src="/pic3.jpg"
                alt="Team Member"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-300 shadow mb-2"
              />
              <h3 className="font-bold text-lg text-purple-800">David Dela</h3>
              <span className="text-purple-500 font-semibold">Designer</span>
              <p className="text-gray-700 text-center text-sm">
                Ensures the platform is fast, secure, and always reliable for
                every event.
              </p>
            </div>
            {/* Team Member 3 */}
            <div className="flex flex-col items-center bg-white/90 rounded-2xl shadow-lg border border-purple-100 p-6 gap-3 hover:scale-105 transition-transform">
              <img
                src="/pic3.jpg"
                alt="Team Member"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-300 shadow mb-2"
              />
              <h3 className="font-bold text-lg text-purple-800">Kwame Owusu</h3>
              <span className="text-purple-500 font-semibold">
                Head of Engineering
              </span>
              <p className="text-gray-700 text-center text-sm">
                Ensures the platform is fast, secure, and always reliable for
                every event.
              </p>
            </div>
          </div>
          <p className="text-purple-700 text-lg mt-6 text-center max-w-2xl">
            Our team is dedicated to making every event a success. We’re here to
            support you every step of the way!
          </p>
        </section>
      </main>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(.4,0,.2,1) both; }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite alternate; }
        .animate-float-slow2 { animation: float-slow2 9s ease-in-out infinite alternate; }
        @keyframes float-slow { 0% { transform: translateY(0); } 100% { transform: translateY(-30px); } }
        @keyframes float-slow2 { 0% { transform: translateY(0); } 100% { transform: translateY(30px); } }
      `}</style>
    </div>
  );
};

export default AboutPage;
