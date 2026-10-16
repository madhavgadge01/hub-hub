import React, { useState } from 'react';
import {
  Check,
  Copy,
  Terminal,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Layers
} from 'lucide-react';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';

export const ResponseViewer = ({
  response,
  loading,
  tool,
  authKey
}) => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('json'); // 'json' | 'curl' | 'headers'
  const [copied, setCopied] = useState(false);

  const jsonString = response ? JSON.stringify(response.data, null, 2) : '';

  const getCurlCommand = () => {
    return `curl -X ${tool.method} "https://api.kruu.dev${tool.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${authKey || 'YOUR_API_KEY'}" \\
  -d '${tool.defaultPayload.replace(/\n\s*/g, ' ')}'`;
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast(`${label} copied to clipboard`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border flex flex-col justify-between transition-all duration-200 dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm overflow-hidden h-full">
      <div>
        {/* Panel Header */}
        <div className="p-4 border-b dark:border-[#222222] border-[#eaeaea] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold dark:text-neutral-300 text-neutral-800">
              Response Console
            </span>
            {response && (
              <Badge variant={response.status === 200 ? 'success' : 'danger'} size="xs">
                {response.status === 200 ? '200 OK' : `${response.status} Error`}
              </Badge>
            )}
          </div>

          {/* Metric telemetry (Time & Size) */}
          {response && (
            <div className="flex items-center gap-3 text-[11px] font-mono dark:text-neutral-400 text-neutral-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>{response.time}ms</span>
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-neutral-400" />
                <span>{response.size}</span>
              </span>
            </div>
          )}
        </div>

        {/* View mode switcher */}
        <div className="px-4 py-2 border-b dark:border-[#222222] border-[#eaeaea] dark:bg-[#0a0a0a] bg-neutral-50/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {[
              { id: 'json', label: 'Body (JSON)', icon: FileJson },
              { id: 'curl', label: 'cURL Command', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    activeTab === tab.id
                      ? 'dark:bg-neutral-800 bg-white font-semibold dark:text-white text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleCopy(activeTab === 'json' ? jsonString : getCurlCommand(), activeTab === 'json' ? 'Response JSON' : 'cURL command')}
            disabled={!response && activeTab === 'json'}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-neutral-400 hover:text-white transition-colors disabled:opacity-30"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Console Body Area */}
        <div className="p-4">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-mono dark:text-neutral-400 text-neutral-500">
                Executing request against edge cluster...
              </p>
            </div>
          ) : activeTab === 'curl' ? (
            <pre className="p-4 rounded-lg font-mono text-xs overflow-x-auto dark:bg-black dark:text-neutral-300 bg-neutral-900 text-neutral-100 border dark:border-[#222222] border-neutral-800 select-all">
              <code>{getCurlCommand()}</code>
            </pre>
          ) : response ? (
            <pre className="p-4 rounded-lg font-mono text-xs overflow-x-auto dark:bg-black bg-neutral-900 text-neutral-100 border dark:border-[#222222] border-neutral-800 max-h-[460px]">
              <code className="text-emerald-400">{jsonString}</code>
            </pre>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl dark:bg-[#111111] bg-neutral-100 border dark:border-[#333333] border-neutral-300 flex items-center justify-center mb-3 text-neutral-400">
                <Terminal className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold dark:text-neutral-300 text-neutral-700 mb-1">
                No Request Dispatched Yet
              </p>
              <p className="text-xs dark:text-neutral-500 text-neutral-400 max-w-xs font-mono text-[11px]">
                Configure request parameters on the left and click "Send Request" to view live JSON output.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t dark:border-[#222222] border-[#eaeaea] dark:bg-[#090909] bg-neutral-50 flex items-center justify-between text-[11px] font-mono dark:text-neutral-400 text-neutral-500">
        <span>Edge Node: iad-1 (North America)</span>
        <span className="text-emerald-500">SSL / TLS 1.3 Verified</span>
      </div>
    </div>
  );
};

export default ResponseViewer;
