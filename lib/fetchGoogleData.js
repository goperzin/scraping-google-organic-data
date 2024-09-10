const puppeteerExtra = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();
puppeteerExtra.use(stealthPlugin());

module.exports = async (query) => {
  try {
    const browser = await puppeteerExtra.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
        "--disable-software-rasterizer",
      ],
      executablePath: "/usr/bin/chromium",
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
    await browser.close();

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
        const response = await axios.get(result.link);

        const contentHtml = response.data;
        const headings = extractHeadings(contentHtml);

        resultsWithHeadings.push({
          ...result,
          headings,
        });

        // Opcional: adicionar um delay para evitar bloqueios
      } catch (error) {
        console.log(`Erro ao acessar ${result.link}:`, error.message);
      }
    }

    console.log("Browser closed");

    return resultsWithHeadings.length > 0 ? resultsWithHeadings : []; // Retorna os resultados com títulos
  } catch (error) {
    console.log("Error in getAllResults:", error.message);
    return []; // Retorna um array vazio em caso de erro
  }
};
