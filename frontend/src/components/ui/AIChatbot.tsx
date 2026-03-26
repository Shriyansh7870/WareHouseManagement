import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';

/* ─── Sample Questions ─── */
const SAMPLE_QUESTIONS = [
  'Which batches expire in the next 30 days?',
  'Show top 5 vendors by QA pass rate',
  'What is the current cold chain status?',
  'List all open CAPAs with critical priority',
  'Which items are below reorder level?',
  'Summarize dispatch performance this month',
  'Show GRN rejection trend last 6 months',
  'Any temperature excursions today?',
];

/* ─── AI Responses (simulated) ─── */
const AI_RESPONSES: Record<string, string> = {
  'Which batches expire in the next 30 days?': '**3 batches expiring within 30 days:**\n\n1. **AMX-D4521** — Amoxicillin 500mg (850 units) — Expires in 13 days\n2. **MET-C1923** — Metformin 850mg (3,200 units) — Expires in 28 days\n3. **ATV-H1156** — Atorvastatin 10mg (4,100 units) — Expires in 25 days\n\n*Recommendation: Initiate FEFO dispatch for AMX-D4521 immediately. Consider return-to-vendor for MET-C1923 if no demand forecast exists.*',
  'Show top 5 vendors by QA pass rate': '**Top 5 Vendors by QA Pass Rate (FY 2023-24):**\n\n1. Aurobindo Pharma — **99.1%** (A+ grade)\n2. Cipla Ltd. — **98.5%** (A+ grade)\n3. Dr. Reddy\'s — **97.1%** (A grade)\n4. Sun Pharma — **96.2%** (A grade)\n5. Zydus Cadila — **95.4%** (A grade)\n\n*Note: Lupin Ltd. at 88.7% is below the 90% threshold — CAPA review recommended.*',
  'What is the current cold chain status?': '**Cold Chain Status Summary:**\n\n- Sensors Online: **7/8** (CR-B-03 offline)\n- Cold Room A Avg: **4.8°C** (within 2-8°C spec)\n- Cold Room B Avg: **2.1°C** (within spec)\n- Open Excursions: **1** (Vehicle VH-01)\n- Uptime: **99.2%** (last 90 days)\n\n*Alert: CR-B-03 has been offline for 6+ hours. Maintenance ticket recommended.*',
  'List all open CAPAs with critical priority': '**Open Critical CAPAs:**\n\n1. **CAP-2024-001** — Repeated dissolution failure in Amoxicillin batches from Lupin Ltd.\n   - Assigned to: Priya Sharma\n   - Due: Apr 15, 2024\n   - Status: IN PROGRESS\n\n*No other critical CAPAs found. 1 major CAPA (CAP-2024-004) is overdue by 3 days.*',
  'Which items are below reorder level?': '**Items Below Reorder Level:**\n\n1. Metformin 850mg — Current: 3,200 / Reorder: 5,000 (64% of target)\n2. Amoxicillin 500mg — Current: 850 / Reorder: 2,000 (42.5% of target)\n\n*AI Recommendation: Raise PO for Metformin from Sun Pharma (5,000 units, 5-day lead time) and Amoxicillin from Lupin Ltd. (2,000 units, 7-day lead time).*',
  'Summarize dispatch performance this month': '**Dispatch Performance — March 2024:**\n\n- Total DOs: **8**\n- Dispatched: **1** | Packed: **5** | In Progress: **1** | Pending: **1**\n- On-Time Delivery: **96.8%** (+0.8% vs target)\n- Avg pick-to-dispatch time: **4.2 hours**\n- Returns: **4** (2 pending inspection)\n\n*Note: 2 urgent/express orders in the queue. Prioritize DO-2024-0005 (Medanta) and DO-2024-0007 (Narayana Health).*',
  'Show GRN rejection trend last 6 months': '**GRN Rejection Trend (Oct 2023 — Mar 2024):**\n\n- Oct: 1 rejection (Lupin — Amoxicillin)\n- Nov: 0 rejections\n- Dec: 0 rejections\n- Jan: 1 rejection (packaging defect)\n- Feb: 0 rejections\n- Mar: 1 quarantine (Amoxicillin D4521 — dissolution fail)\n\n**Overall rejection rate: 3.6%** (5 of 139 batches)\n*Lupin Ltd. accounts for 60% of rejections. Vendor audit recommended.*',
  'Any temperature excursions today?': '**No active excursions today.**\n\nLast excursion: **EXC-2024-002** (March 15)\n- Sensor: VH-01 (Vehicle)\n- Max deviation: 8.8°C for 20 min\n- Status: Open — under investigation\n- Root cause: Pre-cooling not performed\n\n*Cold chain uptime today: 100%. All cold room sensors within spec.*',
};

const DEFAULT_AI_RESPONSE = 'I\'ve analyzed the warehouse data for your query. Based on current inventory levels, QA metrics, and operational trends, everything appears to be within normal parameters.\n\n*For more specific insights, try asking about specific batches, vendors, or modules.*';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'ai', content: 'Hello! I\'m your **AI Warehouse Assistant**. I can help you analyze inventory, track quality metrics, monitor cold chain, and more.\n\nTry one of the suggested questions below, or ask me anything about your warehouse operations.', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const response = AI_RESPONSES[text.trim()] ?? DEFAULT_AI_RESPONSE;
    const aiMsg: ChatMessage = { id: `ai-${Date.now()}`, role: 'ai', content: response, timestamp: new Date() };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#D4A847] text-white shadow-lg hover:bg-[#B8922E] transition-all hover:scale-105 flex items-center justify-center z-50"
        title="Open AI Assistant"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #112D4E, #0A1F38)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#D4A847]/20 flex items-center justify-center">
            <Sparkles size={16} className="text-[#D4A847]" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">AI Warehouse Assistant</div>
            <div className="text-white/50 text-[10px]">Powered by Quantum Invenza AI</div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#D4A847] text-white rounded-br-md'
                : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm'
            }`}>
              {msg.role === 'ai' ? (
                <div className="whitespace-pre-line">
                  {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
                      : part.split(/(\*.*?\*)/).map((sub, j) =>
                          sub.startsWith('*') && sub.endsWith('*') && !sub.startsWith('**')
                            ? <em key={`${i}-${j}`} className="text-gray-500 text-xs">{sub.slice(1, -1)}</em>
                            : <span key={`${i}-${j}`}>{sub}</span>
                        )
                  )}
                </div>
              ) : msg.content}
              <div className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-white/50' : 'text-gray-300'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sample Questions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Suggested Questions</div>
          <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-[#D4A847]/30 text-[#D4A847] hover:bg-[#D4A847]/10 transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your warehouse..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A847]/30 focus:border-[#D4A847]/30"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-[#D4A847] text-white flex items-center justify-center hover:bg-[#B8922E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
