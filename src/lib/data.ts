export type Customer = {
  id: string;
  ipAddress: string;
  username: string;
  macAddress: string;
  status: 'online' | 'offline';
  parent?: string;
};

export const customers: Customer[] = [
  {
    id: 'usr_1',
    ipAddress: '192.168.88.101',
    username: 'john.doe',
    macAddress: '00:1A:2B:3C:4D:5E',
    status: 'online',
    parent: 'Group-A',
  },
  {
    id: 'usr_2',
    ipAddress: '192.168.88.102',
    username: 'jane.smith',
    macAddress: '00:1A:2B:3C:4D:5F',
    status: 'online',
    parent: 'Group-A',
  },
  {
    id: 'usr_3',
    ipAddress: '192.168.88.103',
    username: 'alice.williams',
    macAddress: '00:1A:2B:3C:4E:01',
    status: 'offline',
    parent: 'Group-B',
  },
  {
    id: 'usr_4',
    ipAddress: '192.168.88.104',
    username: 'bob.brown',
    macAddress: '00:1A:2B:3D:4E:02',
    status: 'online',
    parent: 'Group-B',
  },
  {
    id: 'usr_5',
    ipAddress: '192.168.88.105',
    username: 'charlie.davis',
    macAddress: '00:1A:2C:3D:4E:03',
    status: 'online',
    parent: 'Group-A',
  },
  {
    id: 'usr_6',
    ipAddress: '192.168.88.106',
    username: 'diana.miller',
    macAddress: '00:1B:2C:3D:4F:04',
    status: 'offline',
    parent: 'none',
  },
    {
    id: 'usr_7',
    ipAddress: '192.168.88.107',
    username: 'eva.wilson',
    macAddress: '00:1B:3C:4D:5F:05',
    status: 'online',
    parent: 'none',
  },
  {
    id: 'usr_8',
    ipAddress: '192.168.88.108',
    username: 'frank.moore',
    macAddress: '00:1C:3D:4E:5F:06',
    status: 'online',
    parent: 'Group-B',
  },
];
