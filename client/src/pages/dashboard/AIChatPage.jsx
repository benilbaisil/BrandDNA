import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Paperclip,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Code,
  FileText,
  ShieldCheck,
  Trash2
} from 'lucide-react';

export const AIChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello Benil! I am **BrandDNA AI Advisor v4.5** (Enterprise Edition). I am connected directly to your workspace parameters, trademark clearance databases, and competitor matrix.\n\nHow can I help you elevate your brand strategy or legal positioning today?",
      time: 'Just now'
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'Evaluate trademark risk for "Aura AI" in Class 42',
    'Generate 5 tagline variations for an AI legal OS',
    'Audit Linear vs BrandDNA positioning strategy',
    'Draft investor deck summary for Seed Round'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate AI response stream
    setTimeout(() => {
      let aiReplyText = '';
      if (query.toLowerCase().includes('trademark') || query.toLowerCase().includes('class 42')) {
        aiReplyText = `### Trademark Infringement Clearance Report\n\nI searched **14,200,000+ records** in the USPTO and EUIPO registers.\n\n- **Target Mark**: "Aura AI"\n- **Phonetic Collision Index**: 1.2% (Negligible)\n- **Direct Blockers**: 0 Found\n\n\`\`\`json\n{\n  "status": "CLEARED",\n  "confidence": 0.982,\n  "class": 42,\n  "recommendation": "Proceed with USPTO Form TEAS Plus filing immediately."\n}\n\`\`\`\n\nWould you like me to auto-generate the trademark registration draft?`;
      } else if (query.toLowerCase().includes('tagline')) {
        aiReplyText = `Here are 5 high-impact taglines tailored for your brand persona (**The Visionary Creator**):\n\n1. *"Autonomous Brand Intelligence. Zero Legal Risk."*\n2. *"The Investor-Grade Brand OS for Founders."*\n3. *"Create, Protect, and Scale Your Brand with AI."*\n4. *"From Concept to Trademark Clearance in Seconds."*\n5. *"Unbreakable Brand Identity Powered by Neural Strategy."*`;
      } else {
        aiReplyText = `### Strategic AI Assessment\n\nBased on your brand configuration for **BrandDNA AI**, here are key actionable recommendations:\n\n1. **Positioning Moat**: Highlight USPTO trademark search capability to differentiate from generic doc editors like Notion AI.\n2. **Pricing Architecture**: Implement an Enterprise Tier at **$99/month** with unlimited PDF export.\n3. **Content Engine**: Schedule a 4-week thought leadership campaign on AI brand protection.`;
      }

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] space-y-4 text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F291E] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#0F291E] tracking-tight flex items-center gap-2">
              BrandDNA Copilot Chat
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                v4.5 Enterprise
              </span>
            </h1>
            <p className="text-xs text-slate-500">Ask strategic questions, evaluate trademark risks, or draft content.</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-slate-500 hover:text-[#0F291E] hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 text-xs"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-[#0F291E] text-white'
                  : 'bg-blue-50 border border-blue-100 text-blue-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-700" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-2xl space-y-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#0F291E] text-white rounded-tr-none shadow-xs'
                    : 'bg-[#FAF8F5] text-[#0F291E] border border-[#E5E0D8] rounded-tl-none space-y-2'
                }`}
              >
                {/* Formatting render */}
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {msg.sender === 'ai' && (
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-[#E5E0D8] mt-2">
                    <span>Model: BrandDNA-v4.5-Enterprise</span>
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="hover:text-[#0F291E] flex items-center gap-1 transition-colors font-medium"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block px-1">{msg.time}</span>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-[#0F291E] text-white flex items-center justify-center font-bold">
              <Bot className="w-4 h-4 animate-spin text-white" />
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              <span>Thinking & Analyzing USPTO Registers...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase shrink-0">Prompts:</span>
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl glass-panel hover:bg-[#FAF8F5] border border-[#E5E0D8] text-[11px] text-slate-700 hover:text-[#0F291E] whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-2 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs flex items-center gap-2 shrink-0">
        <button
          className="p-2.5 rounded-xl text-slate-400 hover:text-[#0F291E] hover:bg-slate-100 transition-colors"
          title="Attach file or logo"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask BrandDNA AI about trademark risk, strategy, taglines..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-[#0F291E] placeholder-slate-400 outline-none px-2 py-1"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="p-2.5 rounded-xl bg-[#0F291E] text-white font-bold disabled:opacity-40 hover:bg-slate-800 transition-all shadow-xs"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>

    </div>
  );
};

