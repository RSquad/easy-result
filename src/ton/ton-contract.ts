import {
  bocCacheTypePinned,
  bocCacheTypeUnpinned,
  KeyPair,
  TonClient,
} from '@tonclient/core';
import { makeId } from '../utils/id';

declare interface PromiseConstructor {
  allSettled(
    promises: Array<Promise<any>>
  ): Promise<
    Array<{ status: 'fulfilled' | 'rejected'; value?: any; reason?: any }>
  >;
}

export type TonPackage = {
  image: string;
  abi: {};
};

export default class TonContract {
  constructor({
    client,
    name,
    tonPackage,
    keys,
    addr,
  }: {
    client: TonClient;
    name: string;
    tonPackage: TonPackage;
    keys?: KeyPair;
    addr?: string;
  }) {
    this.client = client;
    this.name = name;
    this.tonPackage = tonPackage;
    this.keys = keys;
    this.addr = addr;
  }

  bocRef: any;
  bocId: any;
  bocFetching?: Promise<string>;
  client: TonClient;
  name: string;
  tonPackage: TonPackage;
  keys?: KeyPair;
  addr?: string;

  async init(params?: any) {
    await this.calcAddr(params);
  }

  fetchBoc() {
    if (!this.bocFetching) {
      this.bocFetching = new Promise((res, rej) => {
        this.client.net
          .query_collection({
            collection: 'accounts',
            filter: { id: { eq: this.addr } },
            result: 'boc data',
          })
          .then(
            async (account) => {
              if (!account.result[0]) {
                this.bocFetching = undefined;
                rej(new Error('account not found'));
              }
              if (this.bocId)
                await this.client.boc.cache_unpin({
                  pin: this.bocId,
                });
              this.bocId = makeId(8);
              const { boc_ref } = await this.client.boc.cache_set({
                boc: account.result[0].boc,
                cache_type: bocCacheTypePinned(this.bocId),
              });
              res(boc_ref);
              this.bocFetching = undefined;
            },
            (err) => {
              rej(err);
              this.bocFetching = undefined;
            }
          );
      });
    }
    return this.bocFetching;
  }

  async run({
    functionName,
    input = {},
    preventFetchBoc = true,
  }: {
    functionName: string;
    input?: {};
    preventFetchBoc?: boolean;
  }) {
    if (!this.bocRef) {
      this.bocRef = await this.fetchBoc();
    } else if (!preventFetchBoc) this.bocRef = await this.fetchBoc();
    try {
      const message = await this.client.tvm.run_tvm({
        message: (
          await this.client.abi.encode_message({
            signer: { type: 'None' },
            abi: { type: 'Contract', value: this.tonPackage.abi },
            call_set: {
              function_name: functionName,
              input,
            },
            address: this.addr,
          })
        ).message,
        account: this.bocRef,
        boc_cache: bocCacheTypeUnpinned(),
        abi: { type: 'Contract', value: this.tonPackage.abi },
      });
      // @ts-ignore
      return message.decoded.out_messages[0] as DecodedMessageBody;
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async call({
    functionName,
    input,
    keys,
  }: {
    functionName: string;
    input?: any;
    keys?: KeyPair;
  }) {
    const _keys = keys || this.keys || undefined;
    const result = await this.client.processing.process_message({
      message_encode_params: {
        abi: { type: 'Contract', value: this.tonPackage.abi },
        address: this.addr,
        signer: _keys
          ? {
              type: 'Keys',
              keys: _keys,
            }
          : {
              type: 'None',
            },
        call_set: {
          function_name: functionName,
          input,
        },
      },
      send_events: true,
    });
    return result;
  }

  async send({ message }: { message: string }) {
    const result = await this.client.processing.send_message({
      message,
      send_events: true,
    });
    return result;
  }

  async encodeMessage({
    functionName,
    input,
    keys,
  }: {
    functionName: string;
    input?: any;
    keys?: KeyPair;
  }): Promise<string> {
    const _keys = keys || this.keys || undefined;
    return (
      await this.client.abi.encode_message({
        abi: { type: 'Contract', value: this.tonPackage.abi },
        address: this.addr,
        signer: _keys
          ? {
              type: 'Keys',
              keys: _keys,
            }
          : {
              type: 'None',
            },
        call_set: {
          function_name: functionName,
          input,
        },
      })
    ).message;
  }

  async calcAddr({ initialData } = { initialData: {} }) {
    if (!this.keys) return;
    const deployMsg = await this.client.abi.encode_message({
      abi: { type: 'Contract', value: this.tonPackage.abi },
      signer: {
        type: 'Keys',
        keys: this.keys,
      },
      deploy_set: {
        tvc: this.tonPackage.image,
        initial_data: initialData,
      },
    });
    this.addr = deployMsg.address;
    return deployMsg.address;
  }

  async deploy({
    initialData,
    input,
  }: { initialData?: any; input?: any } = {}) {
    if (!this.keys) throw new Error('keys not specified');
    try {
      return await this.client.processing.process_message({
        message_encode_params: {
          abi: { type: 'Contract', value: this.tonPackage.abi },
          signer: {
            type: 'Keys',
            keys: this.keys,
          },
          deploy_set: {
            tvc: this.tonPackage.image,
            initial_data: initialData,
          },
          call_set: {
            function_name: 'constructor',
            input,
          },
        },
        send_events: false,
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  async getBalance() {
    if (!this.addr) throw new Error('addr not specified');
    const { result } = await this.client.net.query_collection({
      collection: 'accounts',
      filter: { id: { eq: this.addr } },
      result: 'id balance',
    });
    if (!result[0]) {
      return '';
    }
    return parseInt(result[0].balance, 16);
  }
}
