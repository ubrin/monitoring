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
import { ArrowUpDown, BarChart2, Search, Users } from 'lucide-react';
import { type Customer } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type SortKey = keyof Omit<Customer, 'status' | 'parent'>;
type GroupedCustomers = { [key: string]: Customer[] };

// Memoize ChildCustomerTable to prevent re-rendering when its props haven't changed.
const ChildCustomerTable = React.memo(({
  customers,
  onCustomerSelect,
  selectedCustomerId,
  sortConfig,
  handleSort,
}: {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
  selectedCustomerId?: string;
  sortConfig: { key: SortKey; direction: 'ascending' | 'descending' } | null;
  handleSort: (key: SortKey) => void;
}) => {
  const sortedCustomers = React.useMemo(() => {
    if (!customers) return [];
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

  return (
    <div className="w-full">
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
          {sortedCustomers.map((customer) => (
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
                  <span
                    className={cn(
                      'h-2.5 w-2.5 rounded-full transition-colors duration-300', // Added transition for smooth color change
                      customer.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    )}
                  ></span>
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
    </div>
  );
});
ChildCustomerTable.displayName = 'ChildCustomerTable';


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

  const groupedAndFilteredCustomers = React.useMemo(() => {
    const grouped = (customers || []).reduce((acc: GroupedCustomers, customer) => {
      const parentKey = customer.parent || 'none';
      if (!acc[parentKey]) {
        acc[parentKey] = [];
      }
      acc[parentKey].push(customer);
      return acc;
    }, {});

    if (!filter) {
      return grouped;
    }

    const filteredGroups: GroupedCustomers = {};
    for (const parentKey in grouped) {
      const filteredChildren = grouped[parentKey].filter(
        (customer) =>
          customer.username.toLowerCase().includes(filter.toLowerCase()) ||
          customer.ipAddress.includes(filter) ||
          (customer.macAddress && customer.macAddress.toLowerCase().includes(filter.toLowerCase()))
      );
      if (filteredChildren.length > 0) {
        filteredGroups[parentKey] = filteredChildren;
      }
    }
    return filteredGroups;

  }, [customers, filter]);
  
  const getParentIp = (parentName: string): string | undefined => {
    if (parentName === 'none' || !customers) return undefined;
    // The parent is also a queue in the list. We find it by its name.
    const parentQueue = customers.find(c => c.username === parentName);
    return parentQueue?.ipAddress;
  }

  return (
    <Card className="flex-1 flex flex-col h-full">
      <CardHeader>
        <CardTitle>Customer Groups</CardTitle>
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
        <Accordion type="multiple" className="w-full" defaultValue={Object.keys(groupedAndFilteredCustomers)}>
          {Object.entries(groupedAndFilteredCustomers).map(([parent, children]) => {
            const parentIp = getParentIp(parent);
            return (
                <AccordionItem value={parent} key={parent}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className='flex items-center gap-3 w-full'>
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                            <span className="font-bold text-lg">{parent === 'none' ? 'Uncategorized' : parent}</span>
                            {parentIp && <div className="text-xs text-muted-foreground">{parentIp}</div>}
                        </div>
                        <Badge variant="secondary" className="ml-auto mr-4">{children.length} users</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ChildCustomerTable
                        customers={children}
                        onCustomerSelect={onCustomerSelect}
                        selectedCustomerId={selectedCustomerId}
                        sortConfig={sortConfig}
                        handleSort={handleSort}
                    />
                  </AccordionContent>
                </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
