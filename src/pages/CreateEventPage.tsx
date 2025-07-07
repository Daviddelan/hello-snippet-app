import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FilePlus,
  UploadCloud,
  Sparkles,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Navigation from "../components/Navigation";

const CreateEventPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    maxAttendees: "",
    price: "",
    description: "",
    image: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1800);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-white to-purple-200 relative overflow-hidden animate-fade-in-up">
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
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-stretch justify-center py-20 px-4 md:px-10">
          {/* Left: Illustration and headline */}
          <div className="flex-1 flex flex-col justify-center items-start gap-8 md:pr-8 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-2">
              <FilePlus className="text-purple-600" size={44} />
              <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-purple-700 to-purple-900 font-['Montserrat'] drop-shadow-2xl leading-tight">
                Create a New Event
              </h1>
            </div>
            <p className="text-2xl text-gray-700 font-['Inter'] max-w-xl mb-4">
              Bring your community together. Fill out the details and launch
              your event in seconds!
            </p>
            <div className="flex gap-4 mt-2">
              <span className="inline-flex items-center gap-2 bg-purple-100/80 text-purple-700 px-4 py-2 rounded-full font-semibold text-base shadow animate-fade-in-up">
                <Sparkles size={20} /> Fast & Easy
              </span>
              <span className="inline-flex items-center gap-2 bg-purple-100/80 text-purple-700 px-4 py-2 rounded-full font-semibold text-base shadow animate-fade-in-up delay-100">
                <Users size={20} /> Grow Your Audience
              </span>
            </div>
            <img
              src="/clock-purple.jpg"
              alt="Event Illustration"
              className="w-full max-w-xs rounded-3xl shadow-2xl mt-8 hidden md:block animate-fade-in-up"
              style={{ mixBlendMode: "lighten", opacity: 0.7 }}
            />
          </div>
          {/* Right: Form Card */}
          <div className="flex-1 flex flex-col justify-center items-center animate-fade-in-up">
            <div className="w-full bg-white/80 rounded-3xl shadow-2xl border border-purple-200 backdrop-blur-2xl p-10 md:p-14 relative overflow-visible animate-fade-in-up">
              {success ? (
                <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
                  <CheckCircle className="text-green-500 mb-4" size={56} />
                  <h2 className="text-3xl font-bold text-purple-800 mb-2">
                    Event Created!
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">
                    Your event has been created successfully.
                  </p>
                  <a
                    href="/HomePage"
                    className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 text-lg border-2 border-purple-400 animate-fade-in-up"
                  >
                    Go to Events
                  </a>
                </div>
              ) : (
                <form
                  className="flex flex-col gap-8 animate-fade-in-up"
                  onSubmit={handleSubmit}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-purple-700 mb-1">
                        Event Title
                      </label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors bg-white/80"
                        placeholder="e.g. Fire Camp 2025"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-purple-700 mb-1">
                        Date
                      </label>
                      <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        className="px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors bg-white/80"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-purple-700 mb-1">
                        Time
                      </label>
                      <input
                        name="time"
                        type="time"
                        value={form.time}
                        onChange={handleChange}
                        required
                        className="px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors bg-white/80"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-purple-700 mb-1">
                        Location
                      </label>
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        required
                        className="px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors bg-white/80"
                        placeholder="e.g. Accra, Ghana"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-purple-700 mb-1">
                        Max Attendees
                      </label>
                      <input
                        name="maxAttendees"
                        type="number"
                        min="1"
                        value={form.maxAttendees}
                        onChange={handleChange}
                        required
                        className="px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors bg-white/80"
                        placeholder="e.g. 3000"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-purple-700 mb-1">
                        Price (USD)
                      </label>
                      <input
                        name="price"
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={handleChange}
                        required
                        className="px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors bg-white/80"
                        placeholder="e.g. 100 (0 for free)"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-purple-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      className="px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors bg-white/80 min-h-[100px]"
                      placeholder="Describe your event..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-purple-700 mb-1">
                      Event Image
                    </label>
                    <input
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      className="px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition-colors bg-white/80"
                    />
                    {form.image && (
                      <img
                        src={URL.createObjectURL(form.image)}
                        alt="Preview"
                        className="mt-2 w-full max-h-48 object-cover rounded-xl border border-purple-200 shadow"
                      />
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-4 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 border-2 border-purple-400 animate-fade-in-up disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Sparkles className="animate-spin" size={24} /> Creating
                        Event...
                      </>
                    ) : (
                      <>
                        <FilePlus size={24} /> Create Event
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
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
          .animate-float-slow { animation: float-slow 7s ease-in-out infinite alternate; }
          .animate-float-slow2 { animation: float-slow2 9s ease-in-out infinite alternate; }
          @keyframes float-slow { 0% { transform: translateY(0); } 100% { transform: translateY(-30px); } }
          @keyframes float-slow2 { 0% { transform: translateY(0); } 100% { transform: translateY(30px); } }
        `}</style>
      </div>
    </>
  );
};

export default CreateEventPage;
