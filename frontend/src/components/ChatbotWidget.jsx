import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { chatbotApi } from '../api/endpoints.js';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello — I\'m the ArtMind concierge. Ask me about a movement, an artist, or how to find a piece.' },
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
      setMessages((m) => [...m, { role: 'assistant', content: `Sorry — ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open art concierge"
        style={{
          position: 'fixed', bottom: 28, right: 28, width: 58, height: 58,
          background: 'var(--navy)', color: '#000', border: 'none', cursor: 'pointer',
          borderRadius: '50%', fontFamily: 'var(--font-display)', fontSize: '1.1rem', zIndex: 60,
          boxShadow: '0 6px 24px rgba(212,175,95,0.35)',
        }}
      >{open ? '✕' : 'AI'}</button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', bottom: 100, right: 28, width: 360, maxWidth: 'calc(100vw - 40px)',
              height: 480, background: 'var(--light-gray)', border: '1px solid var(--border)', zIndex: 60,
              display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ background: 'var(--navy)', color: '#000', padding: '14px 18px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              ArtMind Concierge
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? 'var(--navy)' : 'var(--white)',
                  color: m.role === 'user' ? '#000' : 'var(--dark-gray)',
                  padding: '10px 14px', fontSize: '0.88rem', maxWidth: '82%',
                  border: '1px solid var(--border)',
                }}>{m.content}</div>
              ))}
              {busy && <div className="muted" style={{ fontSize: '0.8rem' }}>Thinking…</div>}
              <div ref={endRef} />
            </div>
            <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask about art…"
                style={{ flex: 1, border: 'none', padding: '14px', fontFamily: 'var(--font-body)', outline: 'none', background: 'var(--white)', color: 'var(--dark-gray)' }}
              />
              <button onClick={send} disabled={busy} className="btn" style={{ borderRadius: 0 }}>Send</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
