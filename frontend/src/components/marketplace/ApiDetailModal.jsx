import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  ExternalLink,
  PlayCircle,
  FileCode,
  Layers
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';

export const ApiDetailModal = ({ api, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [copied, setCopied] = useState(false);

  if (!api) return null;

  const getCodeSnippet = () => {
    const payloadStr = JSON.stringify(api.samplePayload, null, 2);
    switch (selectedLanguage) {
      case 'node':
        return `const response = await fetch("https://api.hubshubs.dev${api.endpoint.split(' ')[1]}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.HUBS_API_KEY
  },
  body: JSON.stringify(${payloadStr})
});

const data = await response.json();
console.log(data);`;

      case 'python':
        return `import requests
import os

url = "https://api.hubshubs.dev${api.endpoint.split(' ')[1]}"
headers = {
    "Content-Type": "application/json",
    "x-api-key": os.getenv("HUBS_API_KEY")
}
payload = ${payloadStr}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

      case 'curl':
      default:
        return `curl -X POST "https://api.hubshubs.dev${api.endpoint.split(' ')[1]}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $HUBS_API_KEY" \\
  -d '${JSON.stringify(api.samplePayload)}'`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    addToast('Code snippet copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPlayground = () => {
    onClose();
    navigate('/playground');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={api.name}
      subtitle={`${api.category} • ${api.version} • ${api.pricingTier}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Description & Key Specs */}
        <div>
          <p className="text-xs md:text-sm dark:text-neutral-300 text-neutral-700 leading-relaxed">
            {api.description}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
            <div className="p-2.5 rounded-lg border dark:bg-[#111111] dark:border-[#222222] bg-neutral-50 border-neutral-200">
              <span className="text-[10px] uppercase font-mono dark:text-neutral-400 text-neutral-500 block">Latency</span>
              <span className="text-xs font-mono font-bold dark:text-white text-black">{api.latency}</span>
            </div>
            <div className="p-2.5 rounded-lg border dark:bg-[#111111] dark:border-[#222222] bg-neutral-50 border-neutral-200">
              <span className="text-[10px] uppercase font-mono dark:text-neutral-400 text-neutral-500 block">Uptime</span>
              <span className="text-xs font-mono font-bold text-emerald-500">{api.uptime}</span>
            </div>
            <div className="p-2.5 rounded-lg border dark:bg-[#111111] dark:border-[#222222] bg-neutral-50 border-neutral-200">
              <span className="text-[10px] uppercase font-mono dark:text-neutral-400 text-neutral-500 block">Rate Limit</span>
              <span className="text-xs font-mono font-bold dark:text-white text-black">{api.rateLimit}</span>
            </div>
            <div className="p-2.5 rounded-lg border dark:bg-[#111111] dark:border-[#222222] bg-neutral-50 border-neutral-200">
              <span className="text-[10px] uppercase font-mono dark:text-neutral-400 text-neutral-500 block">Cost</span>
              <span className="text-xs font-mono font-bold text-blue-500">{api.costPer1k}</span>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono dark:text-neutral-400 text-neutral-600 mb-2">
            Key Capabilities & Features
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {api.features.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2 dark:text-neutral-300 text-neutral-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Code Snippets Section */}
        <div className="rounded-xl border dark:border-[#222222] border-neutral-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center justify-between px-3 py-2 border-b dark:border-[#222222] border-neutral-200 dark:bg-[#0a0a0a] bg-neutral-100">
            <div className="flex items-center gap-1">
              {[
                { id: 'curl', label: 'cURL' },
                { id: 'node', label: 'Node.js' },
                { id: 'python', label: 'Python' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    selectedLanguage === lang.id
                      ? 'dark:bg-neutral-800 bg-white font-semibold dark:text-white text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono text-neutral-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Snippet Code block */}
          <pre className="p-4 font-mono text-xs overflow-x-auto dark:bg-black dark:text-neutral-300 bg-neutral-900 text-neutral-100">
            <code>{getCodeSnippet()}</code>
          </pre>
        </div>

        {/* Sample Payload & Response Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider dark:text-neutral-400 text-neutral-500 block mb-1.5 font-semibold">
              Sample Request JSON
            </span>
            <pre className="p-3 rounded-lg font-mono text-[11px] overflow-x-auto dark:bg-[#0c0c0c] bg-neutral-100 border dark:border-[#222222] border-neutral-200 dark:text-neutral-300 text-neutral-800">
              <code>{JSON.stringify(api.samplePayload, null, 2)}</code>
            </pre>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider dark:text-neutral-400 text-neutral-500 block mb-1.5 font-semibold">
              Sample Response JSON (200 OK)
            </span>
            <pre className="p-3 rounded-lg font-mono text-[11px] overflow-x-auto dark:bg-[#0c0c0c] bg-neutral-100 border dark:border-[#222222] border-neutral-200 dark:text-emerald-400 text-emerald-700">
              <code>{JSON.stringify(api.sampleResponse, null, 2)}</code>
            </pre>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t dark:border-[#222222] border-[#eaeaea]">
          <button
            type="button"
            onClick={handleOpenPlayground}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border dark:border-[#333333] border-[#eaeaea] dark:bg-black bg-white dark:text-white text-black hover:border-blue-500 transition-colors shadow-sm"
          >
            <PlayCircle className="w-4 h-4 text-blue-500" />
            <span>Test Live in Tools Playground</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApiDetailModal;
