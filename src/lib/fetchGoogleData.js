const puppeteerExtra = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const cheerio = require("cheerio");
const dotenv = require("dotenv");

dotenv.config();
puppeteerExtra.use(stealthPlugin());

module.exports = async (query) => {
  try {
    const browser = await puppeteerExtra.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${query}`, {
      waitUntil: "load",
      timeout: 0,
    });

    const html = await page.content();
    const $ = cheerio.load(html);
    const all = [];

    // Extrai os primeiros 10 resultados
    $("div.g").each((i, elem) => {
      if (i < 10) {
        const h3 = $(elem).find("h3");
        const a = $(elem).find("a");
        const snippetElem = $(elem).find("div:nth-child(2) > div > span");

        const title = h3.text().trim();
        const link = a.attr("href");
        const snippet = snippetElem.text().trim();

        if (title && link) {
          all.push({ title, link, snippet });
        }
      }
    });

    const resultsWithHeadings = [];

    // Função auxiliar para extrair títulos de uma página
    const extractHeadings = (html) => {
      const $ = cheerio.load(html);
      const headings = [];

      $("h1, h2, h3, h4, h5, h6").each((_, elem) => {
        headings.push({
          tag: $(elem).get(0).tagName,
          text: $(elem).text().trim(),
        });
      });

      return headings;
    };

    // Navegar em cada link e extrair os títulos
    for (const result of all) {
      try {
        await page.goto(result.link, { waitUntil: "load", timeout: 0 });
        const contentHtml = await page.content();
        const headings = extractHeadings(contentHtml);

        resultsWithHeadings.push({
          ...result,
          headings,
        });

        // Opcional: adicionar um delay para evitar bloqueios
        await page.waitForTimeout(1000); // Espera 1 segundo entre as requisições
      } catch (error) {
        console.log(`Erro ao acessar ${result.link}:`, error.message);
      }
    }

    await browser.close();
    console.log("Browser closed");

    return resultsWithHeadings.length > 0 ? resultsWithHeadings : []; // Retorna os resultados com títulos
  } catch (error) {
    console.log("Error in getAllResults:", error.message);
    return []; // Retorna um array vazio em caso de erro
  }
};
