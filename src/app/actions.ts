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
        host: '103.160.179.29', // CONTOH: 123.45.67.89
        user: 'APK',           // GANTI DENGAN USER API ANDA
        password: '12341234', // GANTI DENGAN PASSWORD ANDA
        port: 8777,          // GANTI DENGAN PORT PUBLIK YANG ANDA BUAT DI NAT
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
    const simpleQueues = await conn.write('/queue/simple/print', ['?stats']);
    
    // Ubah data dari router menjadi format yang dimengerti aplikasi
    const formattedCustomers: Customer[] = simpleQueues.map((queue: any) => {
        // Logic to determine status based on actual traffic in the queue.
        // If there's any byte traffic (upload or download), we consider the user online.
        const isOnline = (parseInt(queue.bytes?.split('/')[0] || '0') > 0 || parseInt(queue.bytes?.split('/')[1] || '0') > 0);

        return {
            id: queue['.id'] || `queue_${queue.name}`,
            username: queue.name,
            ipAddress: (queue.target || '').split('/')[0], // Remove CIDR suffix if present
            macAddress: queue['mac-address'] || '', // Not always available in simple queues
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
      if (conn && conn.connected) {
          conn.close();
      }
  }
}
