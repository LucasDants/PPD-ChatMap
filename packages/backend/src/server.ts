import { app, io } from "./app";
import { mqConnectionPublisher } from "./publisher";
import { mqConnectionSubscriber } from "./subscriber";

mqConnectionPublisher.connect()
mqConnectionSubscriber.connect()

io.use(async (_, next) => {
  await mqConnectionPublisher.connect()
  await mqConnectionSubscriber.connect()

  return next()
})

app.listen({ port: 3333, host: '0.0.0.0' }, () => console.log("🚀 Server is running on port 3333"))