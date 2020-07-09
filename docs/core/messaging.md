# Actor Model Messaging

DjinnJS uses a modified version of the [Actor Model](https://en.wikipedia.org/wiki/Actor_model) system.

In the traditional Actor Model system, everything is an Actor and everything has an inbox. In the modified version DjinnJS doesn't treat everything as an Actor. Only controllers that need to receive messages are registered as actors, see [Broadcaster](/messaging/broadcaster) for registration information. Any controller within the system can send messages see [Sending Messages](/messaging/sending-messages) for more information.

## Fault Tolerance

Erlang introduced the **let it crash** philosphy. The idea is that you shouldn’t need to program defensively, trying to anticipate all the possible problems that could happen and find a way to handle them, simply because there is no way to think about every single failure point. By simply letting it crash the team must make this critical code be supervised by someone whose only responsibility is to know what to do when this crash happens (like resetting this unit of code to a stable state).
