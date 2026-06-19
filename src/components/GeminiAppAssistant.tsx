import React, { useState } from 'react';
import { Send, Bot, Sparkles, RefreshCw, Loader, AlertTriangle, HelpCircle } from 'lucide-react';

interface CampusAssistantProps {
  studentProfile: any;
  contextData: {
    bookingsCount: number;
    lockersCount: number;
    jobApplications: number;
    proteinQuotas: string;
  };
}

export default function GeminiAppAssistant({ studentProfile, contextData }: CampusAssistantProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const askAssistant = async (customPrompt?: string) => {
    setIsLoading(true);
    setError('');
    const queryText = customPrompt || prompt;
    if (!queryText.trim()) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `User is a ${studentProfile?.role || 'student'} named ${studentProfile?.name || 'Academic Guest'} at ${studentProfile?.campus || 'Stanford University'}.
Current hub status variables:
- Saved Accommodations & Visited properties count: ${contextData.bookingsCount}
- Active freezer/refrigerated cold storage locker logs count: ${contextData.lockersCount}
- Job Applications sent: ${contextData.jobApplications}
- Nutrient protein logs information tracker status: ${contextData.proteinQuotas}

They are asking: "${queryText}"

Provide an elegant, helpful, university or academic advice, plan recommendations, or dynamic response summary of their status. Be compact and professional. Highlight relevant campus guidelines.`,
          systemInstruction: "You are the 'Campus AI Academic Guide', an Elite virtual supervisor for campus logistical, housing, nutrient, laundry, and career operations. Maintain high visual structure, bullet point steps where appropriate, and keep formatting clean."
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.text);
        if (!customPrompt) setPrompt('');
      } else {
        setError(data.error || 'Generative dispatch failed.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed communication with backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTIONS = [
    { text: "Analyze protein vs target & plan meals", query: "Can you analyze my current diet/protein quotas and recommend some marketplace protein meals to help hit my targets?" },
    { text: "Draft cover letter for campus job", query: "Can you draft an elegant academic cover letter for on-campus student jobs highlighting engineering and organization?" },
    { text: "Combine shuttle routes for transit", query: "What shuttle routes should I combine to travel from North Quad Residences to the SciTech Research Lab storage?" }
  ];

  return (
    <div id="gemini-assistant-container" className="bg-white rounded-2xl border border-neutral-150/60 p-6 flex flex-col justify-between h-[450px] shadow-xs hover:border-neutral-200 transition-all">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-rose-50/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl shadow-md shadow-blue-100">
              <Bot className="w-4 h-4 shadow-3xs" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-[#1E293B] text-xs leading-none flex items-center gap-1.5">
                Campus AI Mentor <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-spin-slow" />
              </h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide mt-1">SECURE GEMINI PRO ENGINE</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[8px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold font-mono shadow-3xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block animate-ping"></span> Live Agent
          </span>
        </div>

        {/* Scrollable chatbot responses content */}
        <div className="overflow-y-auto max-h-52 space-y-3 pr-1 text-xs">
          {response ? (
            <div className="bg-[#FAFBFD] p-4 rounded-xl border border-blue-50 space-y-2 leading-relaxed text-[#1E293B] font-sans">
              <div className="font-bold uppercase tracking-wider text-slate-400 text-[8px] border-b border-slate-100 pb-1.5 flex justify-between items-center">
                <span>Generative AI Counsel</span>
                <button onClick={() => setResponse('')} className="text-[9px] text-[#2563EB] hover:text-[#1D4ED8] font-bold font-sans uppercase tracking-widest cursor-pointer">[Clear Session]</button>
              </div>
              <div className="whitespace-pre-line text-[11px] leading-relaxed select-text font-normal text-slate-700">
                {response}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 space-y-2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 mb-1">
                <HelpCircle className="w-5 h-5 text-slate-450" />
              </div>
              <p className="max-w-[280px] leading-relaxed text-[11px] text-slate-500">
                I can optimize your BDT meal budget, model local safety aprons, index housing coordinates, and outline cover letters. Ask a custom prompt below.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 border border-rose-100 bg-rose-50 text-rose-700 text-[10px] rounded-lg font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {/* Suggestion list */}
        {!response && (
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => askAssistant(s.query)}
                className="text-[10px] bg-[#FAFBFD] hover:bg-indigo-50/80 text-indigo-950 font-medium px-3 py-2.5 rounded-xl border border-blue-50/50 hover:border-blue-100 transition-all duration-150 text-left font-sans cursor-pointer flex items-center justify-between"
              >
                <span>{s.text}</span>
                <Sparkles className="w-3 h-3 text-indigo-400 shrink-0 ml-1" />
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Ask AI Counselor logical solutions..."
            onKeyDown={(e) => { if (e.key === 'Enter') askAssistant(); }}
            className="w-full text-xs text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 outline-none hover:border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl px-3 py-2.5 pr-10 transition-all"
          />
          <button
            onClick={() => askAssistant()}
            disabled={isLoading || !prompt.trim()}
            className="absolute right-2 p-1.5 rounded-lg bg-blue-600 text-white disabled:bg-slate-200 disabled:text-slate-400 hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {isLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
