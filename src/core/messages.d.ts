type Message = {
    recipient: string;
    data: MessageData;
};

type MessageData = {
    type: string;
    // eslint-disable-next-line
    [key: string]: any;
};

interface BroadcastWorkerMessage extends Message {
    messageId: string;
    protocol: 'Once' | 'Guaranteed';
    maxAttempts?: number;
    attempts?: number;
}

interface InboxHookupMessage extends MessageData {
    name: string;
    inboxAddress: number;
}

interface InboxDisconnectMessage extends MessageData {
    inboxAddress: number;
}

interface InboxUpdateMessage extends MessageData {
    addresses: Array<{ oldAddressIndex: number; newAddressIndex: number }>;
}

interface UserDeviceInfoMessage extends MessageData {
    memory: number;
    isSafari: boolean;
}
