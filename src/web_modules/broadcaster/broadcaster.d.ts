/**
 * Sends a message to an inbox.
 * @param recipient - the name of the inboxes you want to send a message to
 * @param data - the `MessageData` object that will be sent to the inboxes
 * @param maxAttempts - the maximum number of attempts before the message is dropped, can be set to `Infinity`
 */
export const message: (recipient: string, data: { type: string; [key: string]: any }, maxAttempts?: number) => void;

/**
 * Register and hookup an inbox.
 * @param name - the name of the inbox
 * @param inbox - the function that will handle the inboxes incoming messages
 * @returns inbox UID
 */
export const hookup: (name: string, inbox: Function) => string;

/**
 * Disconnect an inbox.
 * @param inboxId - the UID of the inbox
 */
export const disconnect: (inboxId: string) => void;
