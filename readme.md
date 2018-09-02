## RMQ Abstraction Requirements

  - Provide the means for the application to install all default queues and exchanges on startup, so that the service can be moved from environment to environment without needing to configure a new RMQ server for the service. Creation of objects in RMQ are idempotent, so this shouldn't be complicated at all. Ensure that the service's queue is also bound to its exchange.
  - Provide the means to create new topic/headers exchanges 
  - Provide the means to "subscribe" to another exchange
  - Provide semantics for
    - Commands (send)
    - Events (publish)
    - Deferrals (publishLocal)
     
  ## Enforce the following strategy:
  - Each service gets its own queue that only it (and other instances of itself) will consume.
  - Each service gets its own Fanout exchange which is bound only to the service's queue. Direct exchanges will not work because they cannot be bound to topic exchanges correctly (routing keys need to match exactly).
  - "Commands" are published directly to a service's exchange so that they go straight to that service's queue.
  - "Events" are published to topic exchanges. These exchanges can be as coarsely or finely grained as needed and they can potentially have multiple producers.
    - To "subscribe" to the topic, a service will bind their exchange to the topic's exchange. Use routing key patterns to filter the messages that should be received.
  - Use topic and headers exchanges in the same way. Only use header exchanges for topics that will require more expressive routing/filtering (via headers)

![Topology](https://i.imgur.com/pM16iIZ.jpg)
