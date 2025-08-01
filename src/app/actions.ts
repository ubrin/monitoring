'use server';

// This file is a placeholder for your MikroTik API logic.
// You will need to install a library to connect to the MikroTik API,
// for example, 'node-routeros'. You can install it by running:
// npm install node-routeros
//
// Then, you can use it to connect to your router and fetch data.

import type { Customer, UnregisteredIp } from '@/lib/data';
// Anda mungkin perlu mengimpor library yang Anda install, contoh:
import { RouterOSAPI } from 'node-routeros';

async function getMikrotikConnection() {
  const conn = new RouterOSAPI({
      host: '103.160.179.29',
      user: 'APK',
      password: '12341234',
      port: 8777,
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


// Ini adalah fungsi utama yang akan dipanggil oleh aplikasi Anda.
export async function getCustomers(): Promise<Customer[]> {
  console.log(
    'Fetching customer data from MikroTik Simple Queues and ARP list...'
  );

  let conn: RouterOSAPI | null = null;
  try {
    conn = await getMikrotikConnection();
    
    // Mengambil data dari 'queue simple' dan 'ip arp' secara bersamaan
    const [simpleQueues, arpList] = await Promise.all([
        conn.write('/queue/simple/print'),
        conn.write('/ip/arp/print')
    ]);
    
    // Ubah data dari router menjadi format yang dimengerti aplikasi
    const formattedCustomers: Customer[] = simpleQueues.map((queue: any) => {
        // Logic to determine status based on actual traffic in the queue.
        // If there's any byte traffic (upload or download), we consider the user online.
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
                arpStatus = 'dynamic';
            }
        }
        
        return {
            id: queue['.id'] || `queue_${queue.name}`,
            username: queue.name,
            ipAddress: ipAddress, // Remove CIDR suffix if present
            arpStatus: arpStatus,
            status: isOnline ? 'online' : 'offline',
            parent: queue.parent || 'none',
        };
    });

    return formattedCustomers;

  } catch (error) {
    console.error("Gagal terhubung atau mengambil data dari MikroTik:", error);
    // Jika gagal, kita kembalikan data kosong untuk mencegah aplikasi crash.
    return []; 
  } finally {
      // We are intentionally not closing the connection here to prevent frequent login/logout cycles.
      // The library should handle timeouts and connection closing gracefully.
      // if (conn && conn.connected) {
      //     conn.close();
      // }
  }
}

export async function getUnregisteredIps(): Promise<UnregisteredIp[]> {
  console.log("Fetching unregistered IPs from MikroTik...");
  let conn: RouterOSAPI | null = null;
  try {
    conn = await getMikrotikConnection();

    const [arpList, simpleQueues] = await Promise.all([
      conn.write('/ip/arp/print'),
      conn.write('/queue/simple/print', ['?dynamic=false']), // Hanya ambil queue statis
    ]);

    // Buat set dari alamat IP yang terdaftar di simple queues untuk pencarian cepat
    const registeredIps = new Set(
      simpleQueues.map((queue: any) => (queue.target || '').split('/')[0])
    );
    
    // Filter ARP list untuk menemukan IP yang tidak terdaftar
    const unregistered = arpList.filter(
      (arp: any) => arp.address && !registeredIps.has(arp.address) && arp.dynamic === 'true' // Hanya tampilkan yg dinamis
    );

    return unregistered.map((arp: any) => ({
      id: arp['.id'],
      ipAddress: arp.address,
      macAddress: arp['mac-address'],
      interface: arp.interface,
    }));

  } catch (error) {
    console.error("Gagal mengambil data IP liar dari MikroTik:", error);
    return [];
  } finally {
    //  if (conn && conn.connected) {
    //      conn.close();
    //  }
  }
}
