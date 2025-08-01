'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { testConnection } from '@/app/actions';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  host: z.string().min(1, 'Host is required.'),
  user: z.string().min(1, 'Username is required.'),
  password: z.string().optional(),
  port: z.string().optional(),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: '',
      user: '',
      password: '',
      port: '8728',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    const result = await testConnection(values);
    setIsLoading(false);

    if (result.ok) {
      localStorage.setItem('mikrotikConnection', JSON.stringify(values));
      toast({
        title: 'Connection Successful',
        description: `Successfully connected to ${values.host}.`,
      });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: result.error || 'Could not connect to the MikroTik router.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="host"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 192.168.88.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="user"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="e.g., admin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Port</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 8728" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect'
          )}
        </Button>
      </form>
    </Form>
  );
}
