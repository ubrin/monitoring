'use client';

import { useState } from 'react';
import type { Customer } from '@/lib/data';
import { customers } from '@/lib/data';
import Sidebar from '@/components/layout/sidebar';
import CustomerTable from '@/components/dashboard/customer-table';

export default function DashboardPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);

  return (
    <div className="flex min-h-screen w-full bg-background font-body">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-headline font-bold text-foreground">
            TikWatch
          </h1>
          <p className="text-muted-foreground">Real-time Mikrotik customer monitoring.</p>
        </header>
        <div className="flex-1">
          <CustomerTable onCustomerSelect={setSelectedCustomer} selectedCustomerId={selectedCustomer?.id} />
        </div>
      </main>
    </div>
  );
}
