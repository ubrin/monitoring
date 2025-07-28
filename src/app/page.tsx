'use client';

import { useState } from 'react';
import type { Customer } from '@/lib/data';
import { customers } from '@/lib/data';
import Sidebar from '@/components/layout/sidebar';
import CustomerTable from '@/components/dashboard/customer-table';
import UsageChart from '@/components/dashboard/usage-chart';
import PredictionCard from '@/components/dashboard/prediction-card';

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
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-5 flex-1">
          <div className="lg:col-span-3 flex flex-col">
            <CustomerTable onCustomerSelect={setSelectedCustomer} selectedCustomerId={selectedCustomer?.id} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <UsageChart customer={selectedCustomer} />
            <PredictionCard />
          </div>
        </div>
      </main>
    </div>
  );
}
