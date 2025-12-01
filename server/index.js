import app from "./src/app.js";
import { createUserTable } from "./src/models/user.model.js";
// import { createCategoryTable } from "./models/category.model.js";
// import { createPostTable } from "./models/post.model.js";
import { PORT } from "./src/constant.js";

const startServer = async () => {
  // await createUserTable();
//   await createCategoryTable();
//   await createPostTable();

  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
};

startServer();
