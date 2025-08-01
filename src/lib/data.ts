export type Customer = {
  id: string;
  ipAddress: string;
  username: string;
  arpStatus: 'static' | 'dc' | 'd' | 'disabled' | 'unknown';
  status: 'online' | 'offline';
  parent?: string;
};

export type UnregisteredIp = {
  id: string;
  ipAddress: string;
  macAddress: string;
  interface: string;
}

export type ConnectionDetails = {
    host: string;
    user: string;
    password?: string;
    port?: string;
}
