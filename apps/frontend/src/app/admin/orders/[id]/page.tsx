'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { OrderStatus } from '@/types';

interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  expressFee: number;
  total: number;
  customer: any;
  items: any[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
  deliveryDate?: string;
  payment?: any;
}

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState('');

  const statusOptions: OrderStatus[] = [
    'PENDING',
    'PAID',
    'CONFIRMED',
    'IN_PRODUCTION',
    'READY_FOR_PICKUP',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ];

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getOrder(orderId);
      setOrder(data);
      setNewStatus(data.status);
      setNotes(data.notes || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setIsUpdating(true);
      setError('');
      setSuccess('');

      await adminApi.updateOrderStatus(orderId, newStatus, notes);
      setSuccess('Order updated successfully');
      setTimeout(() => fetchOrder(), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded text-gray-700">
        Order not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {success}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <p className="text-sm text-gray-600 mt-1">Order ID: {order.id}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Back
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-gray-900">{order.customer?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-900">{order.customer?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-gray-900">{order.customer?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-gray-900">{order.customer?.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">City</p>
                <p className="text-gray-900">{order.customer?.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Zip/Postal Code</p>
                <p className="text-gray-900">{order.customer?.zip || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex items-start justify-between border-b pb-4 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product?.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.customizations && Object.keys(item.customizations).length > 0 && (
                        <p className="text-sm text-gray-600">
                          Customizations: {JSON.stringify(item.customizations)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.subtotal?.toFixed(2)}</p>
                      {item.expressApplied && (
                        <p className="text-xs text-orange-600">Express: +${item.expressFee?.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No items</p>
              )}
            </div>
          </div>

          {/* Order Dates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-gray-900">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Updated</p>
                <p className="text-gray-900">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
              {order.deliveryDate && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivery Date</p>
                  <p className="text-gray-900">
                    {new Date(order.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">
                  {order.status}
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add notes about this order..."
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                {isUpdating ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">${order.subtotal?.toFixed(2)}</span>
              </div>
              {order.expressFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Express Fee:</span>
                  <span className="font-medium text-gray-900">${order.expressFee?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">Total:</span>
                <span className="text-lg font-bold text-gray-900">${order.total?.toFixed(2)}</span>
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-600">Payment Status</p>
                <p className="text-gray-900 mt-1">
                  {order.payment?.status || 'No payment recorded'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
