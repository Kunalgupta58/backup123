import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, CheckCircle2, AlertCircle, Loader2, RefreshCw, Play } from 'lucide-react';
import Button from '../ui/Button';
import './VoiceRecorder.css';

/* Animated waveform – 24 bars */
const Waveform = ({ active }) => (
    <div className="vr-wave">
        {Array.from({ length: 24 }).map((_, i) => (
            <span
                key={i}
                className="vr-bar"
                style={{
                    animationDuration: `${0.4 + Math.random() * 0.6}s`,
                    animationDelay: `${Math.random() * 0.4}s`,
                    opacity: active ? 1 : 0.15,
                }}
            />
        ))}
    </div>
);

const STATUS_META = {
    idle: { label: 'Click to begin', color: '#94a3b8' },
    recording: { label: 'Listening…', color: 'var(--accent-primary)' },
    processing: { label: 'Analyzing voice pattern…', color: '#a78bfa' },
    success: { label: 'Voice matched!', color: 'var(--success)' },
    error: { label: 'Recognition failed.', color: 'var(--error)' },
};

const VoiceRecorder = ({ status, onRecord, onReplay, duration = 10, phrase, timeLeft }) => {
    const isActive = status === 'recording';
    const meta = STATUS_META[status] || STATUS_META.idle;

    return (
        <div className="vr-root">
            {/* Phrase card */}
            <div className="vr-phrase">
                <span className="vr-phrase-tag">📢 READ ALOUD</span>
                <p className="vr-phrase-text">{phrase}</p>
            </div>

            {/* Orb */}
            <div className={`vr-orb-wrap vr-orb-${status}`}>
                {isActive && (
                    <>
                        <div className="vr-ring vr-ring-1" />
                        <div className="vr-ring vr-ring-2" />
                        <div className="vr-scanline" />
                    </>
                )}
                <motion.div
                    className="vr-orb"
                    animate={isActive ? {
                        scale: [1, 1.06, 1],
                        boxShadow: [
                            '0 0 30px rgba(0,212,255,0.4)',
                            '0 0 70px rgba(0,212,255,0.7)',
                            '0 0 30px rgba(0,212,255,0.4)',
                        ]
                    } : {}}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                >
                    {status === 'processing' && <Loader2 size={34} className="spin" />}
                    {status === 'success' && <CheckCircle2 size={34} />}
                    {status === 'error' && <AlertCircle size={34} />}
                    {(status === 'idle' || status === 'recording') && <Mic size={34} />}
                </motion.div>
            </div>

            {/* Waveform bars */}
            <Waveform active={isActive} />

            {/* Status text */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={status}
                    className="vr-status"
                    style={{ color: meta.color }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                >
                    {meta.label}
                    {isActive && timeLeft != null && (
                        <span className="vr-timer">{timeLeft}s</span>
                    )}
                </motion.p>
            </AnimatePresence>

            {/* Actions */}
            <div className="vr-actions">
                {status === 'idle' && (
                    <Button variant="primary" icon={Mic} onClick={onRecord} size="lg">
                        Start Recording
                    </Button>
                )}
                {(status === 'success' || status === 'error') && (
                    <div className="vr-action-row">
                        <Button variant="ghost" icon={RefreshCw} onClick={onRecord} size="sm">Retry</Button>
                        {onReplay && <Button variant="secondary" icon={Play} onClick={onReplay} size="sm">Replay</Button>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceRecorder;
