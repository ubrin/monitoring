'use client';

import { useState, useEffect } from 'react';
import type { Customer } from '@/lib/data';
import { getCustomers } from '@/lib/mikrotik';
import Sidebar from '@/components/layout/sidebar';
import CustomerTable from '@/components/dashboard/customer-table';
import { CustomerDetailSheet } from '@/components/dashboard/customer-detail-sheet';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedCustomers = await getCustomers();
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        // Optionally, show a toast notification for the error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


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
          {isLoading ? (
             <div className="space-y-4">
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <CustomerTable 
              customers={customers}
              onCustomerSelect={handleCustomerSelect} 
              selectedCustomerId={selectedCustomer?.id} 
            />
          )}
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
