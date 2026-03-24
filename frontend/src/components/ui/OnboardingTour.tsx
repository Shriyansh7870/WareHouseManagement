import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, LayoutDashboard, Package, Truck, CheckCircle2, Thermometer } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to Quantum Invenza',
    description: 'PharmaTech Manufacturing Pvt. Ltd.\'s GMP-compliant Warehouse Management System. This quick tour will walk you through the key modules.',
    icon: <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl" style={{ background: 'linear-gradient(135deg, #D4A847, #E8B94A)' }}>QI</div>,
    tip: 'You can skip this tour and come back from the Settings page anytime.',
  },
  {
    title: 'Dashboard',
    description: 'Your command center. Monitor GRN trends, inventory health, QA pass rates, cold chain status, and dispatch KPIs — all in one place. KPI cards are clickable and auto-refresh every 60 seconds.',
    icon: <LayoutDashboard size={28} className="text-purple-600" />,
    tip: 'Switch between 5 tabs: Warehouse Ops, Inventory Health, QA, Cold Chain, and Dispatch.',
  },
  {
    title: 'Inventory Ledger',
    description: 'Track all stock in real-time with FEFO (First-Expiry First-Out) enforcement. Rows highlighted in red are within 30-day expiry. Click any batch number to view full traceability.',
    icon: <Package size={28} className="text-blue-600" />,
    tip: 'Use the Export CSV button to download the full inventory snapshot for GMP audits.',
  },
  {
    title: 'Goods Receipt (GRN)',
    description: 'Create GRNs against Advance Shipment Notices (ASNs) or ad-hoc. Each GRN automatically creates an inventory entry with PENDING_QA status. All fields are validated per GMP requirements.',
    icon: <Truck size={28} className="text-emerald-600" />,
    tip: 'Batch numbers in the GRN table are clickable — trace a batch from receipt to dispatch.',
  },
  {
    title: 'Quality Assurance',
    description: 'Review QA inspections, manage quarantine holds, track CAPAs (Corrective and Preventive Actions), and log deviations. Approve, Hold, or Reject batches directly from this module.',
    icon: <CheckCircle2 size={28} className="text-green-600" />,
    tip: 'Only QA Managers and Admins can approve or reject batches — role-based access is enforced.',
  },
  {
    title: 'Cold Chain Monitoring',
    description: 'Live sensor telemetry for all cold storage zones and transport vehicles. Sensors update every 30 seconds. Deviation alerts are flagged automatically with severity classification.',
    icon: <Thermometer size={28} className="text-cyan-600" />,
    tip: 'Temperature excursions are logged and linked to CAPAs for GMP compliance.',
  },
  {
    title: "You're all set!",
    description: 'Explore the remaining modules: Dispatch, Vendors, Documents, Cycle Count, AI Analytics, and Reports. Use keyboard shortcuts (press ? anytime) for fast navigation.',
    icon: <CheckCircle size={28} className="text-purple-600" />,
    tip: 'Press Cmd+K (or Ctrl+K) at any time to search across all modules instantly.',
  },
];

const STORAGE_KEY = 'qi-tour-done';

export function useOnboardingTour() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Slight delay so layout is rendered first
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  };

  const resetTour = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShow(true);
  };

  return { show, dismiss, resetTour };
}

interface OnboardingTourProps {
  onDismiss: () => void;
}

export default function OnboardingTour({ onDismiss }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleDone = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDone} />

      {/* Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ boxShadow: '0 25px 60px rgba(212,168,71,0.2)' }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 w-full">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${((step + 1) / STEPS.length) * 100}%`,
              background: 'linear-gradient(90deg, #D4A847, #E8B94A)',
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Step {step + 1} of {STEPS.length}
          </span>
          <button onClick={handleDone} className="text-gray-300 hover:text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 min-h-[200px]">
          <div className="flex flex-col items-center text-center gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100">
              {current.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>{current.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{current.description}</p>
            </div>
            {current.tip && (
              <div className="w-full bg-purple-50 border border-purple-100 rounded-lg px-4 py-2.5 text-left">
                <p className="text-xs text-purple-600 leading-relaxed">
                  <span className="font-semibold">Tip: </span>{current.tip}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 pb-3">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-purple-500' : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'}`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={isFirst}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>

          <button
            onClick={handleDone}
            className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
          >
            Skip tour
          </button>

          <button
            onClick={isLast ? handleDone : () => setStep((s) => s + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #D4A847, #E8B94A)' }}
          >
            {isLast ? (
              <>
                <CheckCircle size={14} /> Get Started
              </>
            ) : (
              <>
                Next <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
