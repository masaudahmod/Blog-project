import app from "./src/app.js";
import { PORT } from "./src/constant.js";

const startServer = async () => {

  app.listen(PORT, () => {
    console.log("Server running on: " + `http://localhost:${PORT}`);
  });
};

startServer();
