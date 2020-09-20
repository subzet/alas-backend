const {getBalance, getTransactions} = require('./transactionController')
const { getInvestments, getRates } = require('./investmentController')
const admin = require('firebase-admin');
const async = require('async')

async function getMainScreenData(uid){
    try{
        let result = {}
        let balance = await getBalance(uid)
        let transactions = await getTransactions(uid)
        let userData = (await admin.firestore().collection('users').doc(uid).get()).data()
        
        result.username = userData.nickName
        result.balanceLC = balance.lc
        result.balanceDAI = balance.dai
        result.userLC = 'ARS' //THIS HAS TO CHANGE BROO
        result.movements = transactions

        console.log(`Data for user ${uid} retrieved successfully`)
        return({result, code:200})
    }catch(error){
        console.log(`Error while retrieving user data: ${uid}. ${error.message}`)
        return ({msg:`Error while retrieving user data: ${uid}. ${error.message}`, code:500})
    }
}

async function getInvestmentScreenData(uid){
    try{
        let result = {}
        let investments = await getInvestments(uid)
        let protocols = [...new Set(investments.map(investment => investment.extra.protocol))]
        let rates = await getRates(protocols)
        let userData = (await admin.firestore().collection('users').doc(uid).get()).data()

        result.investmentProviders = buildProvidersData(protocols, rates, investments[0].timestamp)
        result.usernaame = userData.nickName
        result.userLC = 'ARS' //THIS HAS TO CHANGE BROO
        

        return {result, code:200}
    }catch(error){
        console.log(`Error while retrieving user data: ${uid}. ${error.message}`)
        return ({msg:`Error while retrieving user data: ${uid}. ${error.message}`, code:500})
    }
}

const buildProvidersData = (protocols, rates, startDate) => {
    async.eachLimit(protocols, (protocol) => {
        const providerRates = rates[protocol]

    });
}


let mock = {
    username: 'mponsa',
    balanceLC: 1300.12,
    balanceDAI: 10.076524,
    userLC: 'ARS',
    investmentProviders:[
        {
            protocol: 'compound',
            actualRate: 0.0682,
            balanceLC: 1300,
            balanceDAI: 10.076524,
            interestLC: 3,
            interestDAI: 0.034,
            sinceDate: '2020-07-23T02:38:55+00:00',
            userLC: 'ARS'
        }
    ] 

}

exports.getMainScreenData = getMainScreenData;
exports.getInvestmentScreenData = getInvestmentScreenData;