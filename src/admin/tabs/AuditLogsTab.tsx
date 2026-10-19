import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { AuditLogEntry } from '../types';
import { ShieldCheck, Search, Clock, ChevronLeft, ChevronRight, RefreshCw, Key } from 'lucide-react';

export const AuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    const res = await adminApi.getAuditLogs({
      search,
      action: actionFilter,
      entity: entityFilter,
      page,
      limit: 30,
    });
    if (res.data) {
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, actionFilter, entityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck size={18} className="text-[#ccff00]" />
            <h2 className="text-lg font-black uppercase font-mono text-white">
              Security Audit Trail & Governance Logs
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Immutable system activity ledger tracking every administrative mutation, stock adjustment, and price modification
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl transition-colors cursor-pointer self-start md:self-auto"
          title="Refresh Logs"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action name, or details..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ccff00]"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
            className="bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Entities</option>
            <option value="product">Product</option>
            <option value="order">Order</option>
            <option value="inventory">Inventory</option>
            <option value="purchase">Purchase</option>
            <option value="expense">Expense</option>
            <option value="auth">Auth</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Timestamp (Dhaka)</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action Signature</th>
                <th className="py-3 px-4">Entity & Target ID</th>
                <th className="py-3 px-4">Mutation Details</th>
                <th className="py-3 px-4 text-right">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    Loading security logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No audit logs recorded for this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[10px] text-neutral-400">
                      {new Date(log.timestamp).toLocaleDateString('en-GB', {
                        timeZone: 'Asia/Dhaka',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{log.actor}</div>
                      <div className="text-[10px] text-neutral-500 uppercase">{log.role}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-950 border border-neutral-800 text-[#ccff00]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="uppercase text-[10px] font-bold text-neutral-400">{log.entity}</div>
                      <div className="font-mono text-white text-[11px]">{log.entityId}</div>
                    </td>

                    <td className="py-3 px-4 max-w-sm truncate text-[11px] text-neutral-300 font-mono">
                      {JSON.stringify(log.details)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[10px] text-neutral-500">
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Page {page} of {totalPages || 1}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 bg-neutral-800 text-white rounded-lg disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 bg-neutral-800 text-white rounded-lg disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
