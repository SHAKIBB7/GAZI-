import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { OrderAdmin } from '../types';
import { formatBDT } from '../../utils/bangladesh';
import { Search, Users, Phone, MapPin, ShoppingBag, ArrowUpRight } from 'lucide-react';

interface CustomerProfile {
  phone: string;
  fullName: string;
  email?: string;
  division: string;
  district: string;
  address: string;
  totalOrders: number;
  totalSpentBdt: number;
  lastOrderDate: string;
  lastOrderId: string;
}

export const CustomersTab: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setIsLoading(true);
      const res = await adminApi.getOrders({ limit: 1000 });
      if (res.data?.orders) {
        const customerMap: Record<string, CustomerProfile> = {};

        res.data.orders.forEach((o) => {
          const phone = o.customer?.phone || 'Unknown';
          if (!customerMap[phone]) {
            customerMap[phone] = {
              phone,
              fullName: o.customer?.fullName || 'Valued Cricketer',
              email: o.customer?.email,
              division: o.customer?.division || 'Dhaka',
              district: o.customer?.district || 'Dhaka',
              address: o.customer?.address || 'Bangladesh',
              totalOrders: 0,
              totalSpentBdt: 0,
              lastOrderDate: o.date,
              lastOrderId: o.orderId,
            };
          }

          if ((o.fulfillmentStatus || o.status) !== 'cancelled') {
            customerMap[phone].totalOrders += 1;
            customerMap[phone].totalSpentBdt += (o.financials?.total || 0);
          }

          if (new Date(o.date).getTime() > new Date(customerMap[phone].lastOrderDate).getTime()) {
            customerMap[phone].lastOrderDate = o.date;
            customerMap[phone].lastOrderId = o.orderId;
          }
        });

        setCustomers(Object.values(customerMap));
      }
      setIsLoading(false);
    }
    loadCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.district.toLowerCase().includes(search.toLowerCase()) ||
      c.division.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, phone (01...), or district..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ccff00]"
          />
        </div>

        <div className="text-xs text-neutral-400 font-mono">
          Total Registered Cricketers: <strong className="text-white">{customers.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Cricketer Name</th>
                <th className="py-3 px-4">Mobile Phone</th>
                <th className="py-3 px-4">Delivery Location</th>
                <th className="py-3 px-4 text-center">Completed Orders</th>
                <th className="py-3 px-4">Lifetime Value (BDT)</th>
                <th className="py-3 px-4">Most Recent Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No cricketers found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.phone} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{c.fullName}</div>
                      {c.email && <div className="text-[11px] text-neutral-400">{c.email}</div>}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-[#ccff00]">
                      {c.phone}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{c.district}, {c.division}</div>
                      <div className="text-[10px] text-neutral-500 truncate max-w-xs">{c.address}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-white">
                      {c.totalOrders}
                    </td>

                    <td className="py-3 px-4 font-mono font-black text-emerald-400 text-sm">
                      {formatBDT(c.totalSpentBdt)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-white text-xs">{c.lastOrderId}</div>
                      <div className="text-[10px] text-neutral-500">
                        {new Date(c.lastOrderDate).toLocaleDateString('en-GB', {
                          timeZone: 'Asia/Dhaka',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
