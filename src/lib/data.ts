export type Customer = {
  id: string;
  ipAddress: string;
  username: string;
  macAddress: string;
  upload: number; // in Mbps
  download: number; // in Mbps
  status: 'online' | 'offline';
};

export const customers: Customer[] = [
  {
    id: 'usr_1',
    ipAddress: '192.168.88.101',
    username: 'john.doe',
    macAddress: '00:1A:2B:3C:4D:5E',
    upload: 10.5,
    download: 50.2,
    status: 'online',
  },
  {
    id: 'usr_2',
    ipAddress: '192.168.88.102',
    username: 'jane.smith',
    macAddress: '00:1A:2B:3C:4D:5F',
    upload: 5.1,
    download: 25.8,
    status: 'online',
  },
  {
    id: 'usr_3',
    ipAddress: '192.168.88.103',
    username: 'alice.williams',
    macAddress: '00:1A:2B:3C:4E:01',
    upload: 2.3,
    download: 10.1,
    status: 'offline',
  },
  {
    id: 'usr_4',
    ipAddress: '192.168.88.104',
    username: 'bob.brown',
    macAddress: '00:1A:2B:3D:4E:02',
    upload: 20.0,
    download: 100.0,
    status: 'online',
  },
  {
    id: 'usr_5',
    ipAddress: '192.168.88.105',
    username: 'charlie.davis',
    macAddress: '00:1A:2C:3D:4E:03',
    upload: 8.9,
    download: 45.3,
    status: 'online',
  },
  {
    id: 'usr_6',
    ipAddress: '192.168.88.106',
    username: 'diana.miller',
    macAddress: '00:1B:2C:3D:4F:04',
    upload: 15.2,
    download: 75.5,
    status: 'offline',
  },
    {
    id: 'usr_7',
    ipAddress: '192.168.88.107',
    username: 'eva.wilson',
    macAddress: '00:1B:3C:4D:5F:05',
    upload: 12.8,
    download: 60.1,
    status: 'online',
  },
  {
    id: 'usr_8',
    ipAddress: '192.168.88.108',
    username: 'frank.moore',
    macAddress: '00:1C:3D:4E:5F:06',
    upload: 3.1,
    download: 15.6,
    status: 'online',
  },
];
