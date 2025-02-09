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


  async consume(queueName: string, handleIncomingNotification: HandlerCB) {

    const queue = await this.channel.assertQueue(queueName, {
      durable: true,
    });

    if (queue.messageCount === 0) {
      return console.log(`No messages in ${queueName}`);
    }

    console.log(`🚀 Waiting for messages in ${queueName}. To exit press CTRL+C`);
    this.channel.consume(
      queueName,
      (msg) => {
        {
          if (!msg) {
            return console.error(`Invalid incoming message`);
          }
          console.log(`📩 Received message from ${queueName}`);
          handleIncomingNotification(msg?.content?.toString());
          this.channel.ack(msg);
          queue.messageCount -= 1;
          console.log(`Message count in ${queueName} is ${queue.messageCount}`);
          if (queue.messageCount === 0) {
            this.channel.cancel(msg.fields.consumerTag);
          }
        }
      },
      {
        noAck: false,
      }
    );
  }
}

export const mqConnectionSubscriber = new RabbitMQConnectionSubscriber();

