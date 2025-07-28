'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, BarChart2, Search } from 'lucide-react';
import { type Customer } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SortKey = keyof Omit<Customer, 'status'>;

export default function CustomerTable({
  customers,
  onCustomerSelect,
  selectedCustomerId,
}: {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
  selectedCustomerId?: string;
}) {
  const [filter, setFilter] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{
    key: SortKey;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'username', direction: 'ascending' });

  const handleSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedCustomers = React.useMemo(() => {
    let sortableItems = [...customers];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [customers, sortConfig]);

  const filteredCustomers = sortedCustomers.filter(
    (customer) =>
      customer.username.toLowerCase().includes(filter.toLowerCase()) ||
      customer.ipAddress.includes(filter) ||
      customer.macAddress.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card className="flex-1 flex flex-col h-full">
      <CardHeader>
        <CardTitle>Active Customers</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by name, IP, or MAC..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('username')}>
                  Username
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('ipAddress')}>
                  IP Address
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">MAC Address</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <BarChart2 className="h-4 w-4" /> Usage (Mbps)
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow
                key={customer.id}
                onClick={() => onCustomerSelect(customer)}
                className={cn(
                  'cursor-pointer',
                  selectedCustomerId === customer.id && 'bg-accent'
                )}
              >
                <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <span className={cn("h-2.5 w-2.5 rounded-full", customer.status === 'online' ? 'bg-green-500' : 'bg-red-500')}></span>
                        {customer.username}
                    </div>
                </TableCell>
                <TableCell>{customer.ipAddress}</TableCell>
                <TableCell className="hidden md:table-cell">{customer.macAddress}</TableCell>
                <TableCell className="text-center">
                  {customer.download.toFixed(2)} / {customer.upload.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
