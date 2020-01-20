/**
 * This package has been modified. Do not update.
 * The package has been locked at v0.1.0
 * Changes:
 * - Removed `setupWorker()` function
 * - Removed workers CDN fallback
 * - File renamed to `broadcaster.js`
 */

import { djinnjsOutDir } from "./config";
import { uuid } from "../../core/env";

class Broadcaster {
    constructor() {
        this.worker = new Worker(`${window.location.origin}/${djinnjsOutDir}/broadcaster-worker.js`);
        this.worker.onmessage = this.handleMessage.bind(this);
        this.inboxes = [];
        this.messageQueue = [];
        this.state = {
            allowMessaging: false,
        };
    }
    /**
     * Set the broadcasters `workerReady` state to `true` and flush any queued messages.
     */
    flushMessageQueue() {
        this.state.allowMessaging = true;
        if (this.messageQueue.length) {
            for (let i = 0; i < this.messageQueue.length; i++) {
                this.worker.postMessage(this.messageQueue[i]);
            }
        }
        this.messageQueue = [];
    }
    sendDataToInboxes(inboxIndexes, data) {
        for (let i = 0; i < inboxIndexes.length; i++) {
            try {
                this.inboxes[inboxIndexes[i]].callback(data);
            } catch (error) {
                this.disconnectInbox(this.inboxes[inboxIndexes[i]], inboxIndexes[i]);
            }
        }
    }
    /**
     * Broadcaster received a message from another thread.
     * This method is an alias of `this.worker.onmessage`
     */
    handleMessage(e) {
        var _a;
        const data = e.data;
        if (((_a = data.recipient) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) === "broadcaster") {
            this.inbox(data.data);
        } else {
            this.sendDataToInboxes(data.inboxIndexes, data.data);
        }
    }
    sendUserDeviceInformation() {
        var _a, _b;
        // @ts-ignore
        const deviceMemory = ((_b = (_a = window.navigator) === null || _a === void 0 ? void 0 : _a.deviceMemory), _b !== null && _b !== void 0 ? _b : 8);
        const isSafari = navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0;
        const workerMessage = {
            recipient: "broadcast-worker",
            messageId: null,
            maxAttempts: 1,
            data: {
                type: "init",
                memory: deviceMemory,
                isSafari: isSafari,
            },
        };
        this.postMessageToWorker(workerMessage);
    }
    /**
     * The broadcaster's personal inbox.
     */
    inbox(data) {
        const { type } = data;
        switch (type) {
            case "ready":
                this.flushMessageQueue();
                this.sendUserDeviceInformation();
                break;
            case "cleanup":
                this.cleanup();
                break;
            case "ping":
                break;
            default:
                console.warn(`Unknown broadcaster message type: ${data.type}`);
                break;
        }
    }
    /**
     * Sends a message to an inbox.
     * @param recipient - the name of the inboxes you want to send a message to
     * @param data - the `MessageData` object that will be sent to the inboxes
     * @param maxAttempts - the maximum number of attempts before the message is dropped, can be set to `Infinity`
     */
    message(recipient, data, maxAttempts = 1) {
        let attempts = maxAttempts;
        if (isNaN(attempts)) {
            attempts = 1;
        } else if (attempts < 1) {
            attempts = 1;
        }
        const workerMessage = {
            recipient: recipient,
            data: data,
            messageId: uuid(),
            maxAttempts: attempts,
        };
        this.postMessageToWorker(workerMessage);
    }
    /**
     * Register and hookup an inbox.
     * @param name - the name of the inbox
     * @param inbox - the function that will handle the inboxes incoming messages
     * @returns inbox UID
     */
    hookup(name, inbox) {
        const newInbox = {
            callback: inbox,
            uid: uuid(),
        };
        const address = this.inboxes.length;
        this.inboxes.push(newInbox);
        const workerMessage = {
            recipient: "broadcast-worker",
            messageId: null,
            maxAttempts: 1,
            data: {
                type: "hookup",
                name: name,
                inboxAddress: address,
            },
        };
        this.postMessageToWorker(workerMessage);
        return newInbox.uid;
    }
    /**
     * Sends a message to the worker using `postMessage()` or queues the message if the worker isn't ready.
     * @param message - the `BroadcastWorkerMessage` object that will be sent
     */
    postMessageToWorker(message) {
        if (this.state.allowMessaging) {
            this.worker.postMessage(message);
        } else {
            this.messageQueue.push(message);
        }
    }
    cleanup() {
        var _a;
        this.state.allowMessaging = false;
        const updatedAddresses = [];
        const updatedInboxes = [];
        for (let i = 0; i < this.inboxes.length; i++) {
            const inbox = this.inboxes[i];
            if (!((_a = inbox) === null || _a === void 0 ? void 0 : _a.disconnected)) {
                const addressUpdate = {
                    oldAddressIndex: i,
                    newAddressIndex: updatedInboxes.length,
                };
                updatedInboxes.push(inbox);
                updatedAddresses.push(addressUpdate);
            }
        }
        this.inboxes = updatedInboxes;
        const workerMessage = {
            recipient: "broadcast-worker",
            messageId: null,
            maxAttempts: 1,
            data: {
                type: "update-addresses",
                addresses: updatedAddresses,
            },
        };
        this.worker.postMessage(workerMessage);
    }
    /**
     * Disconnect an inbox.
     * @param inboxId - the UID of the inbox
     */
    disconnect(inboxId) {
        for (let i = 0; i < this.inboxes.length; i++) {
            const inbox = this.inboxes[i];
            if (inbox.uid === inboxId) {
                this.disconnectInbox(inbox, i);
                break;
            }
        }
    }
    disconnectInbox(inbox, index) {
        inbox.disconnected = true;
        inbox.callback = () => {};
        const workerMessage = {
            recipient: "broadcast-worker",
            messageId: null,
            maxAttempts: 1,
            data: {
                type: "disconnect",
                inboxAddress: index,
            },
        };
        this.postMessageToWorker(workerMessage);
    }
}

const BroadcastManager = new Broadcaster();
/**
 * Sends a message to an inbox.
 * @param recipient - the name of the inboxes you want to send a message to
 * @param data - the `MessageData` object that will be sent to the inboxes
 * @param maxAttempts - the maximum number of attempts before the message is dropped, can be set to `Infinity`
 */
const message = BroadcastManager.message.bind(BroadcastManager);
/**
 * Register and hookup an inbox.
 * @param name - the name of the inbox
 * @param inbox - the function that will handle the inboxes incoming messages
 * @returns inbox UID
 */
const hookup = BroadcastManager.hookup.bind(BroadcastManager);
/**
 * Disconnect an inbox.
 * @param inboxId - the UID of the inbox
 */
const disconnect = BroadcastManager.disconnect.bind(BroadcastManager);

export { disconnect, hookup, message };
