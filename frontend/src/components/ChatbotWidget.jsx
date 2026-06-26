import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { chatbotApi } from '../api/endpoints.js';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I am your AI Art Assistant. I can help you discover artworks, explore painting styles, learn about artists, and find pieces that match your interests.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const history = next.filter((m) => m.role !== 'system').slice(-8);
      const { reply } = await chatbotApi.send(text, history);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `Sorry - ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open art concierge"
        className="chatbot-launcher"
      >
        {open ? (
          <span className="chatbot-launcher__close">×</span>
        ) : (
          <img src="/chatbot-icon.svg" alt="" className="chatbot-launcher__icon" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="chatbot-panel"
          >
            <div className="chatbot-panel__header">
              <div>
                <div className="chatbot-panel__eyebrow">Aurelis</div>
                <div className="chatbot-panel__title">Art Concierge</div>
              </div>
              <span className="chatbot-panel__status">Online</span>
            </div>

            <div className="chatbot-panel__messages">
              {messages.map((m, i) => (
                <div key={i} className={`chatbot-message chatbot-message--${m.role}`}>
                  {m.content}
                </div>
              ))}
              {busy && <div className="chatbot-thinking">Thinking...</div>}
              <div ref={endRef} />
            </div>

            <div className="chatbot-panel__composer">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask about art..."
              />
              <button onClick={send} disabled={busy}>Send</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
