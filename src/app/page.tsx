'use client';

import { useState } from 'react';
import type { Customer } from '@/lib/data';
import { customers as initialCustomers } from '@/lib/data';
import Sidebar from '@/components/layout/sidebar';
import CustomerTable from '@/components/dashboard/customer-table';
import { CustomerDetailSheet } from '@/components/dashboard/customer-detail-sheet';

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
  };
  
  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    setCustomers(prevCustomers => prevCustomers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setSelectedCustomer(updatedCustomer);
  }

  const handleCustomerDelete = (customerId: string) => {
    setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId));
    setSelectedCustomer(null);
  }


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
          <CustomerTable 
            customers={customers}
            onCustomerSelect={handleCustomerSelect} 
            selectedCustomerId={selectedCustomer?.id} 
          />
        </div>
        <CustomerDetailSheet
          customer={selectedCustomer}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedCustomer(null);
            }
          }}
          onUpdateCustomer={handleCustomerUpdate}
          onDeleteCustomer={handleCustomerDelete}
        />
      </main>
    </div>
  );
}
