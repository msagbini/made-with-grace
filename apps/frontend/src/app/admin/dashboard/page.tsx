'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { OrderStatus } from '@/types';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  ordersByStatus: Record<OrderStatus, number>;
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: '📦',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: '💰',
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Products',
      value: stats?.totalProducts || 0,
      icon: '🍪',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Customers',
      value: stats?.totalCustomers || 0,
      icon: '👥',
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg ${card.color} border border-current border-opacity-20`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className="text-4xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats?.ordersByStatus &&
            Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-600">{status}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Order ID</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Customer</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Items</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>{order.customer?.name}</div>
                      <div className="text-xs text-gray-500">{order.customer?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0)} items
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
