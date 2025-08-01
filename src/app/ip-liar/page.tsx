'use client';

import { useState, useEffect } from 'react';
import type { UnregisteredIp } from '@/lib/data';
import { getUnregisteredIps } from '@/app/actions';
import Sidebar from '@/components/layout/sidebar';
import IpLiarTable from '@/components/dashboard/ip-liar-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function IpLiarPage() {
  const [unregisteredIps, setUnregisteredIps] = useState<UnregisteredIp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedIps = await getUnregisteredIps();
        setUnregisteredIps(fetchedIps);
      } catch (error) {
        console.error("Failed to fetch unregistered IPs:", error);
      } finally {
        if (isLoading) {
            setIsLoading(false);
        }
      }
    };

    if (isLoading) {
      fetchData();
    }
    
    const intervalId = setInterval(fetchData, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId);
  }, [isLoading]);

  return (
    <div className="flex min-h-screen w-full bg-background font-body">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-headline font-bold text-foreground">
            IP Liar
          </h1>
          <p className="text-muted-foreground">
            Daftar IP yang aktif di jaringan namun tidak terdaftar di Simple Queues.
          </p>
        </header>
        <div className="flex-1">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-1/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <IpLiarTable unregisteredIps={unregisteredIps} />
          )}
        </div>
      </main>
    </div>
  );
}
