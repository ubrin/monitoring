export type Customer = {
  id: string;
  ipAddress: string;
  username: string;
  arpStatus: 'static' | 'dynamic' | 'disabled' | 'unknown';
  status: 'online' | 'offline';
  parent?: string;
};

export const customers: Customer[] = [
  {
    id: 'usr_1',
    ipAddress: '192.168.88.101',
    username: 'john.doe',
    arpStatus: 'dynamic',
    status: 'online',
    parent: 'Group-A',
  },
  {
    id: 'usr_2',
    ipAddress: '192.168.88.102',
    username: 'jane.smith',
    arpStatus: 'dynamic',
    status: 'online',
    parent: 'Group-A',
  },
  {
    id: 'usr_3',
    ipAddress: '192.168.88.103',
    username: 'alice.williams',
    arpStatus: 'static',
    status: 'offline',
    parent: 'Group-B',
  },
  {
    id: 'usr_4',
    ipAddress: '192.168.88.104',
    username: 'bob.brown',
    arpStatus: 'dynamic',
    status: 'online',
    parent: 'Group-B',
  },
  {
    id: 'usr_5',
    ipAddress: '192.168.88.105',
    username: 'charlie.davis',
    arpStatus: 'disabled',
    status: 'online',
    parent: 'Group-A',
  },
  {
    id: 'usr_6',
    ipAddress: '192.168.88.106',
    username: 'diana.miller',
    arpStatus: 'unknown',
    status: 'offline',
    parent: 'none',
  },
    {
    id: 'usr_7',
    ipAddress: '192.168.88.107',
    username: 'eva.wilson',
    arpStatus: 'dynamic',
    status: 'online',
    parent: 'none',
  },
  {
    id: 'usr_8',
    ipAddress: '192.168.88.108',
    username: 'frank.moore',
    arpStatus: 'static',
    status: 'online',
    parent: 'Group-B',
  },
];
