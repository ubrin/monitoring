'use server';

import type { Customer, UnregisteredIp, ConnectionDetails } from '@/lib/data';
import { RouterOSAPI } from 'node-routeros';

async function getMikrotikConnection(connectionDetails: ConnectionDetails) {
  const { host, user, password, port } = connectionDetails;

  if (!host || !user) {
    throw new Error('Missing connection credentials');
  }

  const conn = new RouterOSAPI({
      host: host,
      user: user,
      password: password || '',
      port: Number(port || 8728),
      timeout: 15,
      legacy: true,
  });

  const connectionPromise = conn.connect();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Connection timed out after 15 seconds')), 15000)
  );

  await Promise.race([connectionPromise, timeoutPromise]);
  return conn;
}

export async function testConnection(connectionDetails: ConnectionDetails): Promise<{ok: boolean, error?: string}> {
    let conn: RouterOSAPI | null = null;
    try {
        conn = await getMikrotikConnection(connectionDetails);
        // A successful connection means the details are valid.
        return { ok: true };
    } catch (error: any) {
        console.error("Connection test failed:", error.message);
        return { ok: false, error: error.message };
    } finally {
         if (conn && conn.connected) {
            // We don't need to keep this connection open.
            conn.close();
        }
    }
}


// The main function to be called by your application.
export async function getCustomers(connectionDetails: ConnectionDetails): Promise<Customer[]> {
  console.log(
    `Fetching customer data from MikroTik ${connectionDetails.host}...`
  );

  let conn: RouterOSAPI | null = null;
  try {
    conn = await getMikrotikConnection(connectionDetails);
    
    // Fetch data from 'queue simple' and 'ip arp' concurrently
    const [simpleQueues, arpList] = await Promise.all([
        conn.write('/queue/simple/print'),
        conn.write('/ip/arp/print')
    ]);
    
    // Transform router data into the application's format
    const formattedCustomers: Customer[] = simpleQueues.map((queue: any) => {
        // Logic to determine status based on actual traffic in the queue.
        const isOnline = (parseInt(queue.bytes?.split('/')[0] || '0') > 0 || parseInt(queue.bytes?.split('/')[1] || '0') > 0);

        const ipAddress = (queue.target || '').split('/')[0];
        const arpEntry = arpList.find((arp: any) => arp.address === ipAddress);

        let arpStatus: Customer['arpStatus'] = 'unknown';
        if (arpEntry) {
            if (arpEntry.disabled === 'true') {
                arpStatus = 'disabled';
            } else if (arpEntry.dynamic === 'false') {
                arpStatus = 'static';
            } else {
                 if (arpEntry.complete === 'true') {
                    arpStatus = 'dc';
                } else {
                    arpStatus = 'd';
                }
            }
        }
        
        return {
            id: queue['.id'] || `queue_${queue.name}`,
            username: queue.name,
            ipAddress: ipAddress,
            arpStatus: arpStatus,
            status: isOnline ? 'online' : 'offline',
            parent: queue.parent || 'none',
        };
    });

    return formattedCustomers;

  } catch (error) {
    console.error(`Failed to connect or fetch data from MikroTik ${connectionDetails.host}:`, error);
    // If it fails, we return empty data to prevent the app from crashing.
    return []; 
  }
}

export async function getUnregisteredIps(connectionDetails: ConnectionDetails): Promise<UnregisteredIp[]> {
  console.log(`Fetching unregistered IPs from MikroTik ${connectionDetails.host}...`);
  let conn: RouterOSAPI | null = null;
  try {
    conn = await getMikrotikConnection(connectionDetails);

    const [arpList, simpleQueues] = await Promise.all([
      conn.write('/ip/arp/print'),
      conn.write('/queue/simple/print', ['?dynamic=false']), // Only fetch static queues
    ]);

    // Create a set of registered IP addresses from simple queues for fast lookup
    const registeredIps = new Set(
      simpleQueues.map((queue: any) => (queue.target || '').split('/')[0])
    );
    
    // Filter the ARP list to find IPs that are not registered and have 'dynamic' and 'complete' status
    const unregistered = arpList.filter(
      (arp: any) =>
        arp.address &&
        !registeredIps.has(arp.address) &&
        arp.dynamic === 'true' && // 'D' flag
        arp.complete === 'true' // 'C' flag
    );

    return unregistered.map((arp: any) => ({
      id: arp['.id'],
      ipAddress: arp.address,
      macAddress: arp['mac-address'],
      interface: arp.interface,
    }));

  } catch (error) {
    console.error(`Failed to fetch rogue IPs from MikroTik ${connectionDetails.host}:`, error);
    return [];
  }
}
