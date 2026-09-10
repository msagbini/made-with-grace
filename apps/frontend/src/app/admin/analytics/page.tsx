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

export default function AdminAnalyticsPage() {
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
      setError(err.message || 'Failed to load analytics');
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

  // Calculate metrics
  const avgOrderValue = stats?.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0;
  const completedOrders = (stats?.ordersByStatus?.['DELIVERED'] || 0) + (stats?.ordersByStatus?.['SHIPPED'] || 0);
  const pendingOrders = (stats?.ordersByStatus?.['PENDING'] || 0) + (stats?.ordersByStatus?.['PAID'] || 0);
  const completionRate = stats?.totalOrders ? ((completedOrders / stats.totalOrders) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Average Order Value</div>
          <div className="text-3xl font-bold text-gray-900">${avgOrderValue}</div>
          <div className="text-xs text-gray-500 mt-2">Revenue per order</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Completed Orders</div>
          <div className="text-3xl font-bold text-gray-900">{completedOrders}</div>
          <div className="text-xs text-gray-500 mt-2">Delivered + Shipped</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Pending Orders</div>
          <div className="text-3xl font-bold text-gray-900">{pendingOrders}</div>
          <div className="text-xs text-gray-500 mt-2">Awaiting action</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Completion Rate</div>
          <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
          <div className="text-xs text-gray-500 mt-2">Orders completed</div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats?.ordersByStatus &&
            Object.entries(stats.ordersByStatus).map(([status, count]) => {
              const percentage = stats.totalOrders
                ? ((count / stats.totalOrders) * 100).toFixed(1)
                : 0;
              return (
                <div key={status} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                    <div className="text-2xl font-bold text-primary">{count}</div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{status}</p>
                  <p className="text-xs text-gray-500">{percentage}% of total</p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Recent Orders with More Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Orders Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Order ID</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Customer</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Items</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Revenue</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => {
                  const itemCount = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                  return (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>{order.customer?.name}</div>
                        <div className="text-xs text-gray-500">{order.customer?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ${order.total?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Orders</p>
            <p className="text-4xl font-bold text-primary">{stats?.totalOrders || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
            <p className="text-4xl font-bold text-green-600">${(stats?.totalRevenue || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Customers</p>
            <p className="text-4xl font-bold text-orange-600">{stats?.totalCustomers || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Active Products</p>
            <p className="text-4xl font-bold text-purple-600">{stats?.totalProducts || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Avg Items per Order</p>
            <p className="text-4xl font-bold text-blue-600">
              {stats?.recentOrders && stats.recentOrders.length > 0
                ? (
                    stats.recentOrders.reduce((sum: number, order: any) => {
                      return sum + (order.items?.length || 0);
                    }, 0) / stats.recentOrders.length
                  ).toFixed(1)
                : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
