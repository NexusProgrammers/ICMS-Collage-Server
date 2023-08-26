import app from "./app.js";
import dbConnect from "./config/dbConnect.js";

const startServer = async () => {
  await dbConnect();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Starting server on port ${PORT}`);
  });
};

startServer();
