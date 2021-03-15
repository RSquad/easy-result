import { TonClient } from '@tonclient/core';
import { libWeb, libWebSetup } from '@tonclient/lib-web';

const NETWORK_MAP = {
  LOCAL: 'http://0.0.0.0',
  DEVNET: 'https://net.ton.dev',
  MAINNET: 'https://main.ton.dev',
};

export const initTonClient = () => {
  libWebSetup({
    binaryURL: 'assets/tonclient.wasm',
  });
  TonClient.useBinaryLibrary(libWeb);
  return new TonClient({
    network: {
      server_address: NETWORK_MAP['MAINNET'],
    },
  });
};
