'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Customer } from '@/lib/data';
import { cn } from '@/lib/utils';
import { BarChart2, Edit, Trash2, WifiOff } from 'lucide-react';
import * as React from 'react';

interface CustomerDetailSheetProps {
  customer: Customer | null;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export function CustomerDetailSheet({
  customer,
  onOpenChange,
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerDetailSheetProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedCustomer, setEditedCustomer] = React.useState<Customer | null>(customer);

  React.useEffect(() => {
    setEditedCustomer(customer);
    if (!customer) {
      setIsEditing(false);
    }
  }, [customer]);

  if (!customer) {
    return null;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedCustomer) {
        setEditedCustomer({ ...editedCustomer, [e.target.id]: e.target.value });
    }
  }

  const handleSave = () => {
    if (editedCustomer) {
        onUpdateCustomer(editedCustomer);
        toast({ title: 'Success', description: 'Customer details updated.' });
        setIsEditing(false);
    }
  };

  const handleDisconnect = () => {
    toast({
      title: `Disconnecting ${customer.username}`,
      description: 'This is a simulated action.',
    });
  };
  
  const handleDelete = () => {
    onDeleteCustomer(customer.id);
    toast({
      variant: 'destructive',
      title: 'Customer Deleted',
      description: `${customer.username} has been removed.`,
    });
  };

  return (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>Customer Details</SheetTitle>
          <SheetDescription>
            View and manage customer information and actions.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="flex-1 overflow-y-auto pr-4 -mr-6">
            <div className="space-y-4 mt-2">
                 <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={editedCustomer?.username || ''} readOnly={!isEditing} onChange={handleInputChange} />
                </div>
                 <div>
                    <Label htmlFor="ipAddress">IP Address</Label>
                    <Input id="ipAddress" value={editedCustomer?.ipAddress || ''} readOnly={!isEditing} onChange={handleInputChange} />
                </div>
                 <div>
                    <Label htmlFor="macAddress">MAC Address</Label>
                    <Input id="macAddress" value={editedCustomer?.macAddress || ''} readOnly={!isEditing} onChange={handleInputChange} />
                </div>
                <div className="flex items-center space-x-4">
                    <div className='flex-1'>
                        <Label>Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={cn("h-2.5 w-2.5 rounded-full", customer.status === 'online' ? 'bg-green-500' : 'bg-red-500')} />
                            <span className='capitalize'>{customer.status}</span>
                        </div>
                    </div>
                    <div className='flex-1'>
                         <Label>Usage</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.download.toFixed(2)} / {customer.upload.toFixed(2)} Mbps</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Separator />

        <SheetFooter className="mt-auto">
            <div className='w-full flex justify-between items-center'>
                 {isEditing ? (
                    <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </>
                ) : (
                    <>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                         <Button variant="outline" size="icon" onClick={handleDisconnect}>
                            <WifiOff className="h-4 w-4" />
                            <span className="sr-only">Disconnect</span>
                        </Button>
                    </div>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                    </Button>
                    </>
                )}
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
