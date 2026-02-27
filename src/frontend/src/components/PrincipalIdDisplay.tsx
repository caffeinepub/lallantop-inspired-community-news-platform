import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Copy, Check, KeyRound } from 'lucide-react';

export default function PrincipalIdDisplay() {
  const { identity } = useInternetIdentity();
  const [copied, setCopied] = useState(false);

  if (!identity) return null;

  const principalId = identity.getPrincipal().toText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(principalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = principalId;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show a truncated version for display
  const shortId =
    principalId.length > 20
      ? `${principalId.slice(0, 10)}...${principalId.slice(-5)}`
      : principalId;

  return (
    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white/70 max-w-[220px]">
      <KeyRound size={10} className="text-news-blue-light shrink-0" />
      <span className="font-mono truncate flex-1" title={principalId}>
        {shortId}
      </span>
      <button
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy Principal ID'}
        className="shrink-0 flex items-center gap-0.5 text-white/60 hover:text-white transition-colors"
      >
        {copied ? (
          <>
            <Check size={10} className="text-green-400" />
            <span className="text-green-400 font-semibold">Copied!</span>
          </>
        ) : (
          <Copy size={10} />
        )}
      </button>
    </div>
  );
}
