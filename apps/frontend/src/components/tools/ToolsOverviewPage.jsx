import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import ToolAppIcon from './ToolAppIcon';
import api from '../../api/client';

export const ToolsOverviewPage = ({
  onSelectTool,
  comparedToolIds = new Set(),
  onToggleCompare,
}) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 28;

  const fetchLatestTools = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      else setLoadingMore(true);

      const currentOffset = initial ? 0 : offset;
      const res = await api.getLatestTools({ limit: PAGE_SIZE, offset: currentOffset });

      if (res.tools) {
        setTools((prev) => (initial ? res.tools : [...prev, ...res.tools]));
        setHasMore(res.pagination?.hasMore || false);
        setTotal(res.pagination?.total || 0);
        setOffset(currentOffset + res.tools.length);
      }
    } catch (err) {
      console.error('Failed to fetch latest software:', err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLatestTools(true);
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-4 px-2 sm:px-6 space-y-6">
      {/* Smartphone Home Screen Header / Subdued Status */}
      <div className="flex items-center justify-between  ">
        <button
          type="button"
          onClick={() => fetchLatestTools(true)}
          className="p-1 rounded-md text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          title="Refresh latest entries"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Smartphone Home Screen Grid: Clean Grid of App Icons + Names Underneath */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-6 gap-x-3 sm:gap-x-4 place-items-center py-8">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-24">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl dark:bg-neutral-900 bg-neutral-200 animate-pulse" />
              <div className="w-14 h-3 rounded dark:bg-neutral-900 bg-neutral-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : tools.length > 0 ? (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-6 gap-x-2 sm:gap-x-4 place-items-center transition-all">
            {tools.map((tool) => (
              <ToolAppIcon
                key={tool.id}
                tool={tool}
                onClick={onSelectTool}
                isCompared={comparedToolIds.has(tool.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>

          {/* Load More Button if more entries exist */}
          {hasMore && (
            <div className="pt-6 pb-12 flex justify-center">
              <button
                type="button"
                onClick={() => fetchLatestTools(false)}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border text-xs font-semibold dark:border-[#262626] border-[#e0e0e0] dark:bg-[#111111] bg-white hover:border-blue-500 dark:hover:border-blue-500 transition-colors shadow-sm disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span>Loading more software...</span>
                  </>
                ) : (
                  <span>Load More Apps</span>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 space-y-3">
          <p className="text-sm dark:text-neutral-400 text-neutral-600">
            No software products published yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolsOverviewPage;
