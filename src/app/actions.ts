'use server';

import type { Customer, UnregisteredIp, ConnectionDetails } from '@/lib/data';
import { RouterOSAPI } from 'node-routeros';

// This is a workaround for a known issue with the 'node-routeros' library in some environments.
// It ensures that the 'tls' module methods are available as expected.
if (typeof(globalThis as any).crypto?.subtle?.digest === 'function' && typeof(globalThis as any).crypto?.getRandomValues === 'function' && typeof(globalThis as any).crypto?.subtle?.importKey === 'function') {
    const tls = require('tls');
    tls.checkServerIdentity = tls.checkServerIdentity || ((hostname: any, cert: any) => {
        return undefined;
    });
}


async function getMikrotikConnection(connectionDetails: ConnectionDetails): Promise<RouterOSAPI> {
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
      // Using 'legacy' is often more compatible, but we remove it to let the library decide.
      // legacy: true, 
  });

  // A more robust connection attempt with a clearer timeout mechanism.
  const connectionPromise = new Promise<RouterOSAPI>((resolve, reject) => {
    conn.connect()
      .then(() => resolve(conn))
      .catch((err: any) => reject(err));
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Connection to ${host} timed out after 15 seconds`)), 15000)
  );

  return Promise.race([connectionPromise, timeoutPromise]);
}

export async function testConnection(connectionDetails: ConnectionDetails): Promise<{ok: boolean, error?: string}> {
    let conn: RouterOSAPI | null = null;
    try {
        conn = await getMikrotikConnection(connectionDetails);
        return { ok: true };
    } catch (error: any) {
        console.error("Connection test failed:", error.message);
        // Provide a more specific error message to the user.
        return { ok: false, error: `Connection failed: ${error.message}` };
    } finally {
         if (conn && conn.connected) {
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
    // Return a proper error instead of empty data to make debugging easier.
    throw new Error(`Failed to fetch customer data: ${error instanceof Error ? error.message : String(error)}`);
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
     throw new Error(`Failed to fetch unregistered IPs: ${error instanceof Error ? error.message : String(error)}`);
  }
}
