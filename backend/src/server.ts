import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`🚀 API server ready at http://localhost:${env.port}`);
  console.log(`   CORS allowed origin: ${env.corsOrigin}`);
});
