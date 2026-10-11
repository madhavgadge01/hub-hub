import React, { useState } from 'react';
import { Terminal, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';
import { PLAYGROUND_TOOLS } from '../data/playgroundTools';
import ToolSelector from '../components/playground/ToolSelector';
import RequestPanel from '../components/playground/RequestPanel';
import ResponseViewer from '../components/playground/ResponseViewer';
import { useApp } from '../context/AppContext';

export const PlaygroundPage = () => {
  const { addToast } = useApp();
  const [selectedTool, setSelectedTool] = useState(PLAYGROUND_TOOLS[0]);
  const [loading, setLoading] = useState(false);
  const [currentAuthKey, setCurrentAuthKey] = useState('');
  const [response, setResponse] = useState({
    status: 200,
    time: 14,
    size: '1.2 KB',
    data: {
      success: true,
      message: 'Select a utility and execute live requests against Hub&Hub microservices.',
    },
  });

  const runTool = async (tool, payload, authKey) => {
    setLoading(true);
    const start = performance.now();
    try {
      const result = await tool.execute(payload, authKey);
      const elapsed = Math.round(performance.now() - start);
      setResponse({
        status: 200,
        time: elapsed,
        size: `${(JSON.stringify(result).length / 1024).toFixed(1)} KB`,
        data: result,
      });
      addToast(`Executed ${tool.name} in ${elapsed}ms`, 'success');
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setResponse({
        status: err.status || 400,
        time: elapsed,
        size: '0.4 KB',
        data: {
          error: err.message || 'Request failed',
          details: err.data || null,
        },
      });
      addToast(err.message || 'Request failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    runTool(tool, tool.defaultPayload, currentAuthKey);
  };

  const handleExecute = (payload, authKey) => {
    setCurrentAuthKey(authKey);
    runTool(selectedTool, payload, authKey);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs dark:text-neutral-400 text-neutral-500 uppercase tracking-wider">
              Interactive Testbench & Sandbox
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight dark:text-white text-black">
            Developer Tools Playground
          </h1>
          <p className="text-xs md:text-sm dark:text-neutral-400 text-neutral-500 mt-0.5">
            Test live microservice payloads directly in the browser with real algorithm verification and instant JSON output.
          </p>
        </div>
      </div>

      {/* Tool Selection Tabs */}
      <ToolSelector
        selectedToolId={selectedTool.id}
        onSelectTool={handleToolSelect}
      />

      {/* Split Screen Playground: Request Panel on Left, Response Console on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[560px]">
        {/* Left Side: Request Configuration */}
        <RequestPanel
          tool={selectedTool}
          onExecute={handleExecute}
          loading={loading}
        />

        {/* Right Side: Response Inspector */}
        <ResponseViewer
          response={response}
          loading={loading}
          tool={selectedTool}
          authKey={currentAuthKey}
        />
      </div>
    </div>
  );
};

export default PlaygroundPage;
