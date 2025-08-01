'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Customer, UnregisteredIp } from '@/lib/data';
import { getCustomers, getUnregisteredIps } from '@/app/actions';
import CustomerTable from '@/components/dashboard/customer-table';
import IpLiarTable from '@/components/dashboard/ip-liar-table';
import { CustomerDetailSheet } from '@/components/dashboard/customer-detail-sheet';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [unregisteredIps, setUnregisteredIps] = useState<UnregisteredIp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [fetchedCustomers, fetchedIps] = await Promise.all([
        getCustomers(),
        getUnregisteredIps(),
      ]);
      setCustomers(fetchedCustomers);
      setUnregisteredIps(fetchedIps);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    fetchData(); // Fetch immediately on mount
    const intervalId = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(intervalId);
  }, [fetchData]);


  const handleCustomerSelect = useCallback((customer: Customer | null) => {
    setSelectedCustomer(customer);
  }, []);
  
  const handleCustomerUpdate = useCallback((updatedCustomer: Customer) => {
    setCustomers(prevCustomers => prevCustomers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setSelectedCustomer(updatedCustomer);
  }, []);

  const handleCustomerDelete = useCallback((customerId: string) => {
    setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId));
    setSelectedCustomer(null);
  }, []);


  return (
    <div className="flex min-h-screen w-full bg-background font-body">
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-headline font-bold text-foreground">
            TikWatch Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time Mikrotik customer and network monitoring.</p>
        </header>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
           {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-1/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <IpLiarTable unregisteredIps={unregisteredIps} />
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
