import client, { Channel, Connection } from "amqplib";

type HandlerCB = (msg: string) => any;


class RabbitMQConnectionSubscriber {
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    try {
      console.log(`⌛️ Connecting to Rabbit-MQ Server`);

      this.connection = await client.connect(
        `amqp://localhost`
      );

      console.log(`✅ Rabbit MQ Connection is ready`);

      this.channel = await this.connection.createChannel();

      console.log(`🛸 Created RabbitMQ Channel successfully`);

      this.connected = true;

    } catch (error) {
      console.error(error);
      console.error(`Not connected to MQ Server`);
    }
  }


  async consume(queue: string, handleIncomingNotification: HandlerCB) {

    await this.channel.assertQueue(queue, {
      durable: true,
    });

    this.channel.consume(
      queue,
      (msg) => {
        {
          if (!msg) {
            return console.error(`Invalid incoming message`);
          }
          handleIncomingNotification(msg?.content?.toString());
          this.channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );

  }
}

export const mqConnectionSubscriber = new RabbitMQConnectionSubscriber();

