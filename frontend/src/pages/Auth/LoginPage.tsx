import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (email === "rahul.mehta@pharmatech.in" && password === "Admin@1234") {
      login(
        { id: "u1", email, name: "Rahul Mehta", role: "QA_MANAGER", isActive: true },
        "mock-jwt-token"
      );
      toast.success("Welcome back, Rahul!");
      navigate("/");
    } else if (email === "info@forgequantumsolution.com" && password === "Welcome@123") {
      login(
        { id: "u2", email, name: "Forge Quantum", role: "ADMIN", isActive: true },
        "mock-jwt-token"
      );
      toast.success("Welcome back, Admin!");
      navigate("/");
    } else {
      toast.error("Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#071018" }}>
      {/* Left side - Warehouse background */}
      <div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center"
        style={{
          backgroundImage: "url(/Warehouse.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay gradients matching navy theme */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(7,16,24,0.4), rgba(7,16,24,0.88))",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(7,16,24,0.7), transparent)",
          }}
        />

        {/* Overlay content */}
        <div className="relative z-10 px-16 max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-[#D4A847] animate-pulse" />
            <span className="text-[#D4A847] text-sm font-semibold uppercase tracking-widest">
              Warehouse Management System
            </span>
          </div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Smart Inventory.
            <br />
            <span className="text-[#E8B94A]">Seamless Control.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Track, manage, and optimize your pharmaceutical warehouse operations
            with real-time insights, quality assurance, and cold chain
            monitoring.
          </p>
          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {[
              "GRN Tracking",
              "Cold Chain",
              "QA Management",
              "Dispatch",
              "AI Analytics",
            ].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium border"
                style={{
                  background: "rgba(212,168,71,0.1)",
                  borderColor: "rgba(212,168,71,0.25)",
                  color: "rgba(232,185,74,0.85)",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div
        className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 relative"
        style={{
          background:
            "linear-gradient(180deg, #0d1f30 0%, #0a1825 50%, #071018 100%)",
        }}
      >
        {/* Subtle warm background glow */}
        <div
          className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: "#D4A847", filter: "blur(120px)" }}
        />

        <div className="w-full max-w-sm relative z-10">
          {/* Logo + Title + Form — tight layout */}
          <div className="flex flex-col items-center mb-5">
            <img
              src="/logo3.png"
              alt="Quantum Invenza Logo"
              className="w-80 h-80 object-contain -mb-2"
            />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              <span className="text-white">Quantum</span>{" "}
              <span style={{ color: "#E8B94A" }}>Invenza</span>
            </h1>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
              border: "1px solid rgba(212,168,71,0.12)",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-base">Sign In</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-[#22c55e]/70 text-[10px] font-medium">
                  System Online
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white/50 text-xs mb-2 font-medium">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(212,168,71,0.4)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(212,168,71,0.4)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(212,168,71,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-2 font-medium">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(212,168,71,0.4)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(212,168,71,0.4)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(212,168,71,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60 relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, #D4A847, #B8922E)",
                  boxShadow: "0 4px 20px rgba(212,168,71,0.3)",
                }}
              >
                <span className="relative z-10">
                  {loading ? "Signing in..." : "Sign In"}
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #E8B94A, #D4A847)",
                  }}
                />
              </button>
            </form>

          </div>

          {/* Footer */}
          <p className="text-white/15 text-[10px] text-center mt-6">
            Powered by Quantum Invenza &middot; v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
