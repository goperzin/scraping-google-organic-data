const fetchGoogleData = require("./lib/fetchGoogleData");

(async () => {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log("Animal, falta o parametro de pesquisa...");
      process.exit(1);
    }

    const queryString = args[0];

    const result = await fetchGoogleData(queryString);
    console.log(result);
    console.log("Tarefa realizada com sucesso");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();
