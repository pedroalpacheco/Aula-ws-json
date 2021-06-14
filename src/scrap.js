const axios = require("axios");
const cheerio = require("cheerio");
const jsonfile = require("jsonfile");

const urlpai =
  "https://www.gov.br/pt-br/noticias/ultimas-noticias?b_start:int=0";

const file = "./noticias.json";

function gravadados(dt) {
  jsonfile
    .writeFile(file, dt, { spaces: 2, flag: "a" })
    .then((res) => {
      console.log("Dados gravados");
    })
    .catch((error) => console.error(error));
}


//Pega os links da pagina
const links = axios.get(urlpai).then((resp) => {
  const dadoshtml = resp.data;
  const $ = cheerio.load(dadoshtml);
  const dados = [];
  $('a[class="summary url"]').each((i, e) => {
    const link = $(e).attr("href");
    //console.log(link)
    dados.push(link);
  });
  //console.log(dados);
  return dados;
});

//Função principal
async function principal() {
  let noticias = [];
  let todoslinks = await links;
  for (let lnk of todoslinks) {
    await axios.get(lnk).then((resp) => {
      const dadoshtml = resp.data;
      const $ = cheerio.load(dadoshtml);
      const titulo = $("h1").text();
      const linkimg = $("img").attr("src");
      const datapublicacao = $('span[class="value"]').text();
      const texto = $('div[property="rnews:articleBody"]').text();

      noticias.push({
        titulo,
        linkimg,
        datapublicacao,
        texto,
      });
    });
  }
  gravadados(noticias);
}
principal();
