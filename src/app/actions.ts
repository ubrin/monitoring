'use server';

// This file is a placeholder for your MikroTik API logic.
// You will need to install a library to connect to the MikroTik API,
// for example, 'node-routeros'. You can install it by running:
// npm install node-routeros
//
// Then, you can use it to connect to your router and fetch data.

import type { Customer } from '@/lib/data';
// Anda mungkin perlu mengimpor library yang Anda install, contoh:
import { RouterOSAPI } from 'node-routeros';

// Helper function to parse 'max-limit' like "10M/20M" into Mbps
function parseRateToMbps(rate?: string): number {
    if (!rate) return 0;
    const rateLower = rate.toLowerCase();
    let value = parseFloat(rateLower);
    if (rateLower.endsWith('m')) {
        return value;
    }
    if (rateLower.endsWith('k')) {
        return value / 1024;
    }
    if (rateLower.endsWith('g')) {
        return value * 1024;
    }
    // Assuming bps if no unit
    return value / 1024 / 1024;
}


// Ini adalah fungsi utama yang akan dipanggil oleh aplikasi Anda.
export async function getCustomers(): Promise<Customer[]> {
  console.log(
    'Fetching customer data from MikroTik Static Queues...'
  );

  // ========================================================================
  // TODO: GANTI BAGIAN INI DENGAN KONEKSI MIKROTIK ASLI ANDA
  // ========================================================================
  //
  // Kode di bawah ini adalah CONTOH ILUSTRATIF. Anda perlu menyesuaikannya.
  let conn: RouterOSAPI | null = null;
  try {
    conn = new RouterOSAPI({
        // GANTI DENGAN IP PUBLIK ROUTER ANDA
        host: 'YOUR_PUBLIC_IP', // CONTOH: 123.45.67.89
        user: 'ubrin',           // GANTI DENGAN USER API ANDA
        password: '12b12bb', // GANTI DENGAN PASSWORD ANDA
        port: 28728,          // GANTI DENGAN PORT PUBLIK YANG ANDA BUAT DI NAT
        // timeout di sini adalah untuk socket setelah terhubung, bukan timeout koneksi
        timeout: 15,
        legacy: true, // Aktifkan mode legacy untuk RouterOS versi lama
    });

    // Implementasi timeout koneksi manual
    const connectionPromise = conn.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timed out after 15 seconds')), 15000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);
    
    // Mengambil data dari 'queue simple'
    const simpleQueues = await conn.write('/queue/simple/print');
    
    // Ubah data dari router menjadi format yang dimengerti aplikasi
    const formattedCustomers: Customer[] = simpleQueues.map((queue: any) => {
        const [uploadLimit, downloadLimit] = (queue['max-limit'] || '0/0').split('/');
        
        // Logic to determine status based on actual traffic in the queue.
        // If there's any byte traffic (upload or download), we consider the user online.
        const isOnline = (parseInt(queue.bytes?.split('/')[0] || '0') > 0 || parseInt(queue.bytes?.split('/')[1] || '0') > 0);

        return {
            id: queue['.id'] || `queue_${queue.name}`,
            username: queue.name,
            ipAddress: (queue.target || '').split('/')[0], // Remove CIDR suffix if present
            macAddress: queue['mac-address'] || '', // Not always available in simple queues
            upload: parseRateToMbps(uploadLimit), 
            download: parseRateToMbps(downloadLimit),
            status: isOnline ? 'online' : 'offline', 
        };
    });

    return formattedCustomers;

  } catch (error) {
    console.error("Gagal terhubung atau mengambil data dari MikroTik:", error);
    // Jika gagal, kita kembalikan data kosong untuk mencegah aplikasi crash.
    return []; 
  } finally {
      if (conn && conn.connected) {
          conn.close();
      }
  }
}
