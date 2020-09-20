const cheerio = require('cheerio'),
      axios = require('axios'),
      url = `https://defirate.com/dai/`
      moment = require('moment'),
      admin = require('firebase-admin');

const DEFI_HTML_TABLE_ROWS = '#table-results > tbody > tr'
      

async function getData(){
    const response = await axios.get(url)
    if(response.status == 200){
        return response.data
    }
}


async function scrapRates(){
    const data = await getData()
    const $ = cheerio.load(data)
    const table_rows = $(DEFI_HTML_TABLE_ROWS)
    console.log('Loaded html from defi rates.')
    const providers = []
    for(let i = 0; i < table_rows.length; i++){
        try{
            let result = {}
            result.providerName = $(table_rows[i].children[0].children[0]).children('img').attr("alt").toLowerCase()
            result.providerImg = $(table_rows[i].children[0].children[0]).children('img').attr("data-src")
            result.actualInterest = Number($(table_rows[i].children[1].children[0]).text().replace('%',''))
            result.avgInterest = Number($(table_rows[i].children[2].children[0]).text().replace('%',''))
            result.timestamp = admin.firestore.FieldValue.serverTimestamp()
            providers.push(result)
        }catch(error){
            console.log(error.message)
        }                                                                                                                                                                    
    }

    return providers
}

module.exports = { scrapRates }