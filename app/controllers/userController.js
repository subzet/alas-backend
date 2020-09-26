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
        let rates = await getRates(protocols, investments[investments.length - 1].timestamp.toDate())
        let userData = (await admin.firestore().collection('users').doc(uid).get()).data()

        result.investmentProviders = await buildProvidersData(protocols, rates, investments)
        result.username = userData.nickName
        result.userLC = 'ARS' //THIS HAS TO CHANGE BROO
        result.balanceDAI = result.investmentProviders.reduce((sum, provider) => sum + (provider.balanceDAI || 0), 0)
    
        
        return {result, code:200}
    }catch(error){
        console.log(`Error while retrieving user data: ${uid}. ${error.message}`)
        return ({msg:`Error while retrieving user data: ${uid}. ${error.message}`, code:500})
    }
}

const buildProvidersData = async (protocols, rates, investments) => {
    providers = []
    protocols.forEach((protocol) => {
        let providersReturn = []
        let totalMovements = 0
        const providerRates = rates[protocol]
        
        providerRates.forEach((rate, index) => {
            let initialBalance = 0
            if (index != 0) {
                initialBalance = providersReturn[index - 1].finalBalance   
            }
                let date = rate.timestamp.toDate()
                let movements = getMovements(investments, date)
                totalMovements += movements
                let dailyRate =  (Math.pow(((rate.averageRate/100) + 1),(1/365)) - 1) * 100
                let finalBalance = (initialBalance + movements) * (1 + dailyRate)
                providersReturn.push({
                        initialBalance,
                        movements,
                        dailyRate,
                        finalBalance,
                        date
                    })
        })

        let balanceDAI = providersReturn[providersReturn.length - 1].finalBalance 
        let interestDAI = balanceDAI - totalMovements
        let actualRate = providerRates[providerRates.length - 1].averageRate
        let sinceDate = moment(providerRates[0].timestamp.toDate()).format()

        providers.push({
            protocol,
            balanceDAI,
            interestDAI,
            actualRate,
            sinceDate
        })
        
    });

    return providers
}


const getMovements = (investmentArray, date) => {
    const movementType = ['investment','withdraw-from-investment']
    let result = 0

    investmentArray.forEach(investment => {
        if(datesAreOnSameDay(investment.timestamp.toDate(), date)){
            if(movementType.indexOf(investment.type) == 0){
                result += investment.amountDAI
            }else{
                result -= investment.amountDAI
            }
        }
    })

    return result
}

const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();


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