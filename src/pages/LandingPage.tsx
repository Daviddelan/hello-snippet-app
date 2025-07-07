import React from "react";
import {
  ShieldCheck,
  Clock,
  Bot,
  Handshake,
  Sparkles,
  Wallet,
  Leaf,
  Search,
  CreditCard,
  Smartphone,
  FilePlus,
  BarChart3,
  Rocket,
  MessageCircle,
  Lock,
  TreeDeciduous,
  Smile,
  TrendingUp,
  ArrowUpCircle,
  PartyPopper,
  Waves,
  Users,
  Star,
  Globe2,
  HeartHandshake,
  Ticket,
  BadgeCheck,
  HelpCircle,
} from "lucide-react";
import Navigation from "../components/Navigation";
import SignInPage from "./SignInPage";

// Add Google Fonts for premium headings
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;600&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Enhanced FeatureCard with parallax and glow
type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
};

const FeatureCard = ({
  icon,
  title,
  children,
  delay = 0,
}: FeatureCardProps) => (
  <div
    className="bg-white/60 backdrop-blur-2xl border border-purple-200 rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center transition-transform duration-300 hover:scale-[1.07] hover:shadow-purple-300/40 hover:shadow-2xl hover:border-purple-400 group min-h-[240px] w-full relative overflow-hidden animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute -top-8 -right-8 opacity-20 pointer-events-none">
      <Waves size={64} className="text-purple-200" />
    </div>
    <div className="mb-5 drop-shadow-xl group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h4 className="font-bold text-purple-800 text-2xl mb-2 tracking-tight font-['Montserrat'] drop-shadow-lg">
      {title}
    </h4>
    <div className="text-gray-700 text-base leading-relaxed font-['Inter']">
      {children}
    </div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-300/40 via-purple-100/0 to-purple-300/40 blur-sm opacity-70" />
  </div>
);

// Animated scroll-to-top button
const ScrollToTop = () => {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return show ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-50 bg-white/80 border border-purple-300 shadow-xl rounded-full p-3 hover:bg-purple-100 transition-all animate-fade-in-up backdrop-blur-lg"
      aria-label="Scroll to top"
    >
      <ArrowUpCircle size={36} className="text-purple-600" />
    </button>
  ) : null;
};

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-purple-100 via-white to-purple-200 min-h-screen text-gray-900 relative text-[15px] md:text-base">
      {/* Animated SVG background blobs */}
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
          fillOpacity="0.25"
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
          fillOpacity="0.18"
        />
      </svg>
      {/* Glassmorphic Navbar with logo shine and CTA */}
      <nav className="flex justify-between items-center px-4 py-5 md:px-8 md:py-5 fixed top-0 left-0 right-0 z-30 backdrop-blur-2xl bg-white/70 border-b border-purple-200 shadow-2xl rounded-b-2xl animate-fade-in-up text-[15px] md:text-base">
        {/* Use the Navigation logo for consistency */}
        <div className="flex items-center gap-2 md:gap-3">
          <img
            src="/hellosnippet_transparent.png"
            alt="Hello Snippet Logo"
            className="h-8 w-auto md:h-9"
          />
        </div>
        <ul className="flex gap-5 md:gap-8 font-semibold text-gray-700 text-base md:text-lg">
          <li>
            <a
              href="#how-it-works"
              className="hover:text-purple-700 transition-colors duration-200"
            >
              How It Works
            </a>
          </li>
          <li>
            <a
              href="#about-us"
              className="hover:text-purple-700 transition-colors duration-200"
            >
              About Us
            </a>
          </li>
          <li>
            <a
              href="#eco"
              className="hover:text-purple-700 transition-colors duration-200"
            >
              Less Paper, More Trees
            </a>
          </li>
          <li>
            <a
              href="#pricing"
              className="hover:text-purple-700 transition-colors duration-200"
            >
              Pricing
            </a>
          </li>
        </ul>
        <a
          href="/signin"
          className="ml-4 md:ml-8 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-5 py-2.5 md:px-7 md:py-3 rounded-xl font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 text-base md:text-lg border-2 border-purple-400 animate-fade-in-up"
        >
          Get Started
        </a>
      </nav>
      {/* Hero Section with animated confetti/particles and purple clock accent */}
      <section
        className="relative flex flex-col items-center justify-center text-center min-h-[70vh] w-full overflow-hidden bg-gradient-to-br from-purple-100 via-white to-purple-200"
        style={{ paddingTop: "140px", paddingBottom: "50px" }}
      >
        {/* Purple clock image as hero accent */}
        <img
          src="/clock-purple.jpg"
          alt="Event Clock"
          className="absolute top-0 right-0 w-[520px] h-[320px] object-cover rounded-3xl shadow-2xl opacity-60 z-0 hidden md:block"
          style={{ mixBlendMode: "lighten" }}
        />
        {/* Animated confetti using Lucide PartyPopper icons */}
        <PartyPopper
          size={64}
          className="absolute top-24 left-32 text-purple-300 animate-float-slow2 opacity-60 z-10"
        />
        <PartyPopper
          size={48}
          className="absolute top-40 right-40 text-purple-400 animate-float-slow opacity-40 z-10"
        />
        <Star
          size={60}
          className="absolute top-32 left-1/2 text-yellow-400 animate-float-slow2 opacity-30 z-10"
        />
        <Globe2
          size={54}
          className="absolute bottom-32 right-60 text-purple-300 animate-float-slow opacity-30 z-10"
        />
        {/* Large, bold, gradient headline */}
        <h1 className="w-full max-w-4xl mx-auto text-3xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-purple-700 to-purple-900 drop-shadow-2xl font-['Montserrat'] animate-fade-in mb-6 px-2 md:px-0 leading-tight">
          Plan events and book tickets —{" "}
          <span className="whitespace-nowrap">the smart way.</span>
        </h1>
        <p className="w-full max-w-2xl mx-auto text-lg md:text-2xl text-gray-700 font-['Inter'] animate-fade-in delay-100 mb-8 px-2 md:px-0">
          Welcome to Hello Snippet: the trusted, easy-to-use ticketing platform
          that makes event planning and attending smoother, safer, and smarter.
        </p>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center animate-fade-in delay-200 mb-8">
          <a
            href="/signin"
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 text-lg border-2 border-purple-400 animate-fade-in-up"
          >
            Start Now
          </a>
          <a
            href="/HomePage"
            className="bg-white/90 border border-purple-400 text-purple-700 px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-purple-50 hover:scale-105 transition-all duration-200 text-lg backdrop-blur animate-fade-in-up"
          >
            Browse Events
          </a>
        </div>
        {/* Testimonial and trusted-by badge, now moved to top right on large screens and below buttons on mobile */}
        <div className="w-full flex flex-col md:flex-row md:justify-end md:items-start items-center gap-6 md:gap-8 px-2 md:px-10 mt-2 md:mt-0">
          <div className="bg-white/90 border border-purple-200 rounded-2xl shadow-xl px-6 py-4 flex flex-col items-center max-w-xs animate-fade-in-up md:mt-0 mt-6 text-base md:text-lg">
            <div className="text-purple-600 text-4xl mb-2">
              <Star size={32} className="inline-block text-yellow-400 mr-1" />“
            </div>
            <p className="text-gray-700 italic mb-2 text-lg">
              “The easiest event platform I’ve ever used. Our ticket sales
              doubled!”
            </p>
            <span className="text-purple-800 font-semibold">
              — Happy Organizer
            </span>
          </div>
          <div className="flex flex-col items-center animate-fade-in-up">
            <img
              src="/icon500x500.png"
              alt="Trusted by"
              className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-purple-300 mb-2 shadow-xl"
            />
            <span className="text-purple-800 font-bold text-base md:text-lg flex items-center gap-2">
              <BadgeCheck className="text-purple-500" size={22} />
              Trusted by 1,000+ organizers
            </span>
          </div>
        </div>
      </section>
      {/* Section 2: Problems as Cards */}
      <section className="py-14 md:py-20 px-2 md:px-8 max-w-[1200px] mx-auto text-center animate-fade-in-up">
        <div className="rounded-2xl bg-white/70 shadow-2xl p-8 md:p-14 backdrop-blur-2xl border border-purple-200 flex flex-col gap-10 items-center relative overflow-visible">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-purple-900 font-['Montserrat']">
            You shouldn’t have to worry when buying or selling event tickets.
          </h2>
          <p className="mb-10 text-2xl max-w-2xl mx-auto font-['Inter']">
            Let’s be honest — ticketing platforms have made things harder than
            they should be.
          </p>
          {/* Floating Lucide icons for visual interest */}
          <Ticket
            size={64}
            className="absolute -top-12 left-16 hidden md:block animate-float-slow text-purple-200 opacity-40"
          />
          <HelpCircle
            size={64}
            className="absolute -bottom-12 right-16 hidden md:block animate-float-slow2 text-purple-300 opacity-30"
          />
          {/* Subtle blended background using user images */}
          <div className="absolute inset-0 w-full h-full pointer-events-none select-none -z-10">
            <img
              src="/pic1.jpg"
              alt="bg1"
              className="absolute top-0 left-0 w-1/2 h-2/3 object-cover opacity-20 mix-blend-multiply blur-xl"
            />
            <img
              src="/pic2.jpg"
              alt="bg2"
              className="absolute bottom-0 right-0 w-1/3 h-1/2 object-cover opacity-20 mix-blend-lighten blur-2xl"
            />
            <img
              src="/pic3.jpg"
              alt="bg3"
              className="absolute top-1/3 right-1/4 w-1/4 h-1/3 object-cover opacity-10 mix-blend-overlay blur-2xl"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
            <FeatureCard
              icon={<ShieldCheck size={56} className="text-purple-600" />}
              title="Fake Events"
              delay={0}
            >
              Too many fake events.
            </FeatureCard>
            <FeatureCard
              icon={<Clock size={56} className="text-purple-600" />}
              title="Slow or Lost Refunds"
              delay={100}
            >
              Too many slow or lost refunds.
            </FeatureCard>
            <FeatureCard
              icon={<Bot size={56} className="text-purple-600" />}
              title="Unhelpful Support Bots"
              delay={200}
            >
              And way too many support bots that don’t help.
            </FeatureCard>
          </div>
          <p className="text-2xl font-semibold text-purple-700 max-w-2xl mx-auto font-['Inter']">
            We built Hello Snippet to change that — and to make event
            experiences feel easy again.
          </p>
        </div>
      </section>
      {/* Section 3: What Makes Us Different as Cards, with pastel gradient background */}
      <section
        className="py-24 px-2 md:px-8 animate-fade-in-up max-w-[1800px] mx-auto relative"
        id="about-us"
      >
        {/* Subtle blended background using user images */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none -z-10">
          <img
            src="/pic4.jpg"
            alt="bg4"
            className="absolute top-0 left-0 w-1/2 h-2/3 object-cover opacity-20 mix-blend-multiply blur-xl"
          />
          <img
            src="/pic5.jpg"
            alt="bg5"
            className="absolute bottom-0 right-0 w-1/3 h-1/2 object-cover opacity-20 mix-blend-lighten blur-2xl"
          />
        </div>
        <div className="rounded-3xl bg-white/70 shadow-2xl p-14 md:p-20 backdrop-blur-2xl border border-purple-200 flex flex-col gap-14 items-center relative overflow-visible">
          <h2 className="text-5xl font-bold mb-14 text-purple-900 text-center font-['Montserrat']">
            What Makes Us Different?
          </h2>
          {/* Wavy SVG divider above cards */}
          <svg
            className="absolute -top-8 left-0 w-full h-10"
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#c4b5fd"
              fillOpacity="0.3"
              d="M0,32L48,53.3C96,75,192,117,288,117.3C384,117,480,75,576,74.7C672,75,768,117,864,133.3C960,149,1056,139,1152,117.3C1248,96,1344,64,1392,48L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            ></path>
          </svg>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-12 w-full z-10">
            <FeatureCard
              icon={<ShieldCheck size={48} className="text-purple-600" />}
              title="Verified Events Only"
              delay={0}
            >
              Every organizer is reviewed and approved to protect attendees from
              scams.
            </FeatureCard>
            <FeatureCard
              icon={<Wallet size={48} className="text-purple-600" />}
              title="Fair Refund Promise"
              delay={100}
            >
              If an event is cancelled or fraudulent, we refund you fast. No
              chasing. No stress.
            </FeatureCard>
            <FeatureCard
              icon={<Handshake size={48} className="text-purple-600" />}
              title="Real-Time Support"
              delay={200}
            >
              Talk to humans, not helpdesk robots. We’re here for you — always.
            </FeatureCard>
            <FeatureCard
              icon={<Sparkles size={48} className="text-purple-600" />}
              title="Clean, Modern Experience"
              delay={300}
            >
              No clunky dashboards. No hidden fees. Just a simple, intuitive
              system that works.
            </FeatureCard>
            <FeatureCard
              icon={<Clock size={48} className="text-purple-600" />}
              title="Fast Payouts for Organizers"
              delay={400}
            >
              Track sales. Get paid. Grow your audience — without the headaches.
            </FeatureCard>
            <FeatureCard
              icon={<Leaf size={48} className="text-purple-600" />}
              title="100% Digital, Eco-Friendly"
              delay={500}
            >
              Paperless tickets. Zero waste. And we plant trees as you grow.
            </FeatureCard>
          </div>
        </div>
      </section>
      {/* Section 4: Attendee/Organizer Flows as Cards */}
      <section
        className="py-24 px-2 md:px-8 max-w-[1600px] mx-auto animate-fade-in-up relative"
        id="eco"
      >
        {/* Subtle blended background using user images, less blur */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none -z-10">
          <img
            src="/pic2.jpg"
            alt="bg-eco-1"
            className="absolute top-0 left-0 w-1/2 h-2/3 object-cover opacity-18 mix-blend-multiply blur-sm"
          />
          <img
            src="/pic3.jpg"
            alt="bg-eco-2"
            className="absolute bottom-0 right-0 w-1/3 h-1/2 object-cover opacity-16 mix-blend-lighten blur"
          />
        </div>
        <div className="rounded-3xl bg-white/70 shadow-2xl p-14 md:p-20 backdrop-blur-2xl border border-purple-200 flex flex-col gap-14 items-center relative overflow-visible">
          <h2 className="text-5xl font-bold mb-14 text-purple-900 text-center font-['Montserrat']">
            Whether you’re planning an event or buying a ticket, Hello Snippet
            makes it easy:
          </h2>
          {/* Vertical divider between attendee/organizer flows on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 w-full relative">
            <div className="flex flex-col gap-10 relative">
              <h3 className="font-semibold text-2xl mb-2 text-purple-700 flex items-center justify-center gap-2 font-['Montserrat']">
                <Users className="text-purple-400" size={28} /> For Attendees
              </h3>
              <FeatureCard
                icon={<Search size={48} className="text-purple-600" />}
                title="Find an Event"
                delay={0}
              >
                Browse verified events near you or online.
              </FeatureCard>
              <FeatureCard
                icon={<CreditCard size={48} className="text-purple-600" />}
                title="Buy a Ticket in Seconds"
                delay={100}
              >
                No accounts, no fuss. Just pay and receive your digital ticket
                instantly.
              </FeatureCard>
              <FeatureCard
                icon={<Smartphone size={48} className="text-purple-600" />}
                title="Show Up and Enjoy"
                delay={200}
              >
                Your ticket is in your email and phone — no printing, no stress.
              </FeatureCard>
              <div className="hidden md:block absolute top-0 right-[-32px] h-full w-2 bg-gradient-to-b from-purple-200/60 to-purple-400/10 rounded-full opacity-60"></div>
            </div>
            <div className="flex flex-col gap-10">
              <h3 className="font-semibold text-2xl mb-2 text-purple-700 flex items-center justify-center gap-2 font-['Montserrat']">
                <HeartHandshake className="text-purple-400" size={28} /> For
                Event Organizers
              </h3>
              <FeatureCard
                icon={<FilePlus size={48} className="text-purple-600" />}
                title="Sign Up & List Your Event"
                delay={0}
              >
                It takes less than 5 minutes to create your event and go live.
              </FeatureCard>
              <FeatureCard
                icon={<BarChart3 size={48} className="text-purple-600" />}
                title="Sell With Confidence"
                delay={100}
              >
                Track your ticket sales in real-time and get paid fast.
              </FeatureCard>
              <FeatureCard
                icon={<Rocket size={48} className="text-purple-600" />}
                title="Host & Grow"
                delay={200}
              >
                Focus on your event — we’ll handle the tech, support, and
                ticketing.
              </FeatureCard>
            </div>
          </div>
          <p className="mt-14 text-center text-2xl text-purple-700 font-semibold max-w-2xl mx-auto font-['Inter']">
            Hello Snippet is built for speed, clarity, and peace of mind.
            <br />
            No tech skills needed. No delays. Just pure event power.
          </p>
        </div>
      </section>
      {/* Section 5: Toolkit as Cards */}
      <section
        className="py-24 px-2 md:px-8 bg-purple-50/70 max-w-[1600px] mx-auto text-center animate-fade-in-up relative"
        id="pricing"
      >
        {/* Subtle blended background using user images, less blur */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none -z-10">
          <img
            src="/pic1.jpg"
            alt="bg-toolkit-1"
            className="absolute top-0 left-0 w-1/2 h-2/3 object-cover opacity-14 mix-blend-multiply blur-sm"
          />
          <img
            src="/pic4.jpg"
            alt="bg-toolkit-2"
            className="absolute bottom-0 right-0 w-1/3 h-1/2 object-cover opacity-12 mix-blend-lighten blur"
          />
        </div>
        <div className="rounded-3xl bg-white/70 shadow-2xl p-14 md:p-20 backdrop-blur-2xl border border-purple-200 flex flex-col gap-14 items-center relative overflow-visible">
          <h2 className="text-5xl font-bold mb-10 text-purple-900 font-['Montserrat']">
            Whether you’re hosting a conference, a party, or a music event...
          </h2>
          <p className="mb-10 text-2xl font-['Inter']">
            Hello Snippet is your toolkit for:
          </p>
          {/* Floating Lucide icons for visual interest */}
          <PartyPopper
            size={64}
            className="absolute -top-12 right-16 hidden md:block animate-float-slow text-purple-200 opacity-40"
          />
          <Globe2
            size={64}
            className="absolute -bottom-12 left-16 hidden md:block animate-float-slow2 text-purple-300 opacity-30"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 w-full">
            <FeatureCard
              icon={<Sparkles size={48} className="text-purple-600" />}
              title="Quick Setup"
              delay={0}
            >
              Quick and easy event setup
            </FeatureCard>
            <FeatureCard
              icon={<Lock size={48} className="text-purple-600" />}
              title="Secure Delivery"
              delay={100}
            >
              Fast and secure ticket delivery
            </FeatureCard>
            <FeatureCard
              icon={<MessageCircle size={48} className="text-purple-600" />}
              title="Live Support"
              delay={200}
            >
              Live support whenever you need help
            </FeatureCard>
            <FeatureCard
              icon={<TreeDeciduous size={48} className="text-purple-600" />}
              title="Eco-Friendly"
              delay={300}
            >
              Greener events with zero paper waste
            </FeatureCard>
          </div>
        </div>
      </section>
      {/* Section 6: Impact as Cards */}
      <section className="py-24 px-2 md:px-8 max-w-[1200px] mx-auto text-center animate-fade-in-up relative">
        {/* Subtle blended background using user images, less blur */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none -z-10">
          <img
            src="/pic5.jpg"
            alt="bg-impact-1"
            className="absolute top-0 left-0 w-1/2 h-2/3 object-cover opacity-15 mix-blend-multiply blur-sm"
          />
          <img
            src="/pic3.jpg"
            alt="bg-impact-2"
            className="absolute bottom-0 right-0 w-1/3 h-1/2 object-cover opacity-13 mix-blend-lighten blur"
          />
        </div>
        <div className="rounded-3xl bg-white/70 shadow-2xl p-14 md:p-20 backdrop-blur-2xl border border-purple-200 flex flex-col gap-14 items-center">
          <h2 className="text-5xl font-bold mb-10 text-purple-900 font-['Montserrat']">
            Let Your Event Do More
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full mb-10">
            <FeatureCard
              icon={<Clock size={48} className="text-purple-600" />}
              title="Save Time"
              delay={0}
            >
              Less time wasted on broken systems
            </FeatureCard>
            <FeatureCard
              icon={<Smile size={48} className="text-purple-600" />}
              title="Less Frustration"
              delay={100}
            >
              Less frustration for attendees
            </FeatureCard>
            <FeatureCard
              icon={<TrendingUp size={48} className="text-purple-600" />}
              title="More Growth"
              delay={200}
            >
              More confidence, more clarity, more growth
            </FeatureCard>
          </div>
          <p className="mb-4 text-xl font-['Inter']">
            And together, we’re building something bigger — events that are
            easy, safe, and sustainable.
          </p>
        </div>
      </section>
      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center animate-fade-in-up">
        <div className="rounded-3xl bg-white/10 shadow-2xl p-16 backdrop-blur-2xl border border-purple-200 max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 drop-shadow-xl font-['Montserrat']">
            Join the smarter way to host and attend events.
          </h2>
          <p className="mb-10 text-2xl font-medium font-['Inter']">
            Start your event journey today — backed by a team that actually
            cares.
          </p>
          <a
            href="/HomePage"
            className="bg-white/90 text-purple-700 px-12 py-6 rounded-2xl font-bold shadow-xl hover:bg-purple-50 hover:scale-105 transition-all duration-200 text-2xl backdrop-blur border-2 border-purple-400 animate-fade-in-up"
          >
            Get Started
          </a>
        </div>
      </section>
      {/* Sticky glassy footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-2xl border-t border-purple-200 shadow-2xl py-4 px-8 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-2 text-purple-700 font-semibold text-lg">
          <img
            src="/hellosnippet_transparent.png"
            alt="Hello Snippet Logo"
            className="w-8 h-8 rounded-full border border-purple-300"
          />
          Hello Snippet &copy; {new Date().getFullYear()}
        </div>
        <div className="flex gap-6 text-purple-600 text-xl">
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener"
            className="hover:text-purple-800 transition-colors"
          >
            <Star size={22} />
          </a>
          <a
            href="https://facebook.com/"
            target="_blank"
            rel="noopener"
            className="hover:text-purple-800 transition-colors"
          >
            <Globe2 size={22} />
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener"
            className="hover:text-purple-800 transition-colors"
          >
            <Smile size={22} />
          </a>
        </div>
      </footer>
      {/* Scroll to top button */}
      <ScrollToTop />
      {/* Animations and custom styles */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in { animation: fade-in 1.2s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-pulse-slow { animation: pulse 6s cubic-bezier(.4,0,.6,1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite alternate; }
        .animate-float-slow2 { animation: float-slow2 9s ease-in-out infinite alternate; }
        @keyframes float-slow { 0% { transform: translateY(0); } 100% { transform: translateY(-30px); } }
        @keyframes float-slow2 { 0% { transform: translateY(0); } 100% { transform: translateY(30px); } }
        .animate-logo-shine {
          position: relative;
        }
        .animate-logo-shine:after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.7) 100%);
          opacity: 0.5;
          border-radius: 9999px;
          pointer-events: none;
          animation: logo-shine 3.5s linear infinite;
        }
        @keyframes logo-shine {
          0% { transform: translateX(-100%) rotate(10deg); }
          100% { transform: translateX(100%) rotate(10deg); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
