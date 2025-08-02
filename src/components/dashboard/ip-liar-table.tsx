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
import { ArrowUpDown, Search, ShieldAlert } from 'lucide-react';
import { type UnregisteredIp } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type SortKey = keyof UnregisteredIp;

export default function IpLiarTable({ unregisteredIps }: { unregisteredIps: UnregisteredIp[] }) {
  const [filter, setFilter] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{
    key: SortKey;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'ipAddress', direction: 'ascending' });

  const handleSort = React.useCallback((key: SortKey) => {
    setSortConfig(prevSortConfig => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (prevSortConfig?.key === key && prevSortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      return { key, direction };
    });
  }, []);

  const sortedAndFilteredIps = React.useMemo(() => {
    let sortableItems = [...(unregisteredIps || [])];
    
    if (filter) {
        sortableItems = sortableItems.filter(
            (ip) =>
              ip.ipAddress.toLowerCase().includes(filter.toLowerCase()) ||
              ip.macAddress.toLowerCase().includes(filter.toLowerCase()) ||
              ip.interface.toLowerCase().includes(filter.toLowerCase())
        );
    }

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
  }, [unregisteredIps, filter, sortConfig]);

  return (
    <Card className="flex-1 flex flex-col h-full">
      <CardHeader>
        <CardTitle>Daftar IP Liar</CardTitle>
        <CardDescription>
            Total ditemukan <Badge variant="destructive">{sortedAndFilteredIps.length}</Badge> IP liar.
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter berdasarkan IP, MAC, atau Interface..."
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
                <Button variant="ghost" size="sm" onClick={() => handleSort('ipAddress')}>
                  IP Address
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort('macAddress')}>
                  MAC Address
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" size="sm" onClick={() => handleSort('interface')}>
                  Interface
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredIps.map((ip) => (
              <TableRow key={ip.id}>
                <TableCell className="font-mono">{ip.ipAddress}</TableCell>
                <TableCell className="font-mono">{ip.macAddress}</TableCell>
                <TableCell>{ip.interface}</TableCell>
              </TableRow>
            ))}
             {sortedAndFilteredIps.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                    <ShieldAlert className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className='font-medium'>Aman!</p>
                    <p className='text-muted-foreground'>Tidak ada IP liar yang terdeteksi.</p>
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
