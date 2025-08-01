'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Customer, UnregisteredIp, ConnectionDetails } from '@/lib/data';
import { getCustomers, getUnregisteredIps } from '@/app/actions';
import CustomerTable from '@/components/dashboard/customer-table';
import IpLiarTable from '@/components/dashboard/ip-liar-table';
import { CustomerDetailSheet } from '@/components/dashboard/customer-detail-sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogoutButton } from '@/components/dashboard/logout-button';

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [unregisteredIps, setUnregisteredIps] = useState<UnregisteredIp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [connection, setConnection] = useState<ConnectionDetails | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedConnection = localStorage.getItem('mikrotikConnection');
    if (!storedConnection) {
      router.push('/login');
    } else {
      setConnection(JSON.parse(storedConnection));
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    if (!connection) return;

    try {
      const [fetchedCustomers, fetchedIps] = await Promise.all([
        getCustomers(connection),
        getUnregisteredIps(connection),
      ]);
      setCustomers(fetchedCustomers);
      setUnregisteredIps(fetchedIps);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Optional: handle error, e.g., show toast, redirect to login on auth error
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [connection, isLoading]);

  useEffect(() => {
    if (connection) {
      fetchData(); // Fetch immediately once connection is set
      const intervalId = setInterval(fetchData, 5000); // Refresh every 5 seconds
      return () => clearInterval(intervalId);
    }
  }, [connection, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('mikrotikConnection');
    setConnection(null);
    router.push('/login');
  };
  
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
  
  if (!connection) {
    return (
       <div className="flex min-h-screen w-full items-center justify-center bg-background">
         <p>Redirecting to login...</p>
       </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-background font-body">
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-headline font-bold text-foreground">
              TikWatch Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitoring {connection.host}
            </p>
          </div>
          <LogoutButton onLogout={handleLogout} />
        </header>

        <Tabs defaultValue="customers" className="flex-1 flex flex-col">
          <TabsList className="mb-4 self-start">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="unregistered-ips">IP Liar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers" className="flex-1">
             {isLoading ? (
               <div className="space-y-4 h-full">
                  <Skeleton className="h-12 w-1/4" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="flex-1 w-full" />
              </div>
            ) : (
              <CustomerTable 
                customers={customers}
                onCustomerSelect={handleCustomerSelect} 
                selectedCustomerId={selectedCustomer?.id} 
              />
            )}
          </TabsContent>
          <TabsContent value="unregistered-ips" className="flex-1">
             {isLoading ? (
                <div className="space-y-4 h-full">
                  <Skeleton className="h-12 w-1/4" />
                  <Skeleton className="flex-1 w-full" />
                </div>
              ) : (
                <IpLiarTable unregisteredIps={unregisteredIps} />
              )}
          </TabsContent>
        </Tabs>

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
