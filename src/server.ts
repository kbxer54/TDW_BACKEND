import app from "./app";
import { AppDataSource } from "./data-source";

const PORT = process.env.PORT || 3000; // Defina a porta aqui

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    // Logar o caminho completo da API
    console.log(`Server is running on http://localhost:${PORT}`); // Isso já mostra o caminho básico do servidor
    app.listen(PORT, () => {
      console.log(`Server running at full URL: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
