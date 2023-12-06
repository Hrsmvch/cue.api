const ExchangesSchema = require('../models/Exchanges');
const BalanceModel = require('../models/Balance');
const axios = require('axios');

const createExchanges = async (req, res) => {
  try {
    let exchangeRate;
    const { fromCurrency, toCurrency, amount } = req.body;

    const url = `https://api.apilayer.com/exchangerates_data/latest?symbols=${toCurrency}&base=${fromCurrency}`;
    
    const balance = await BalanceModel.findOne({ user: req.userId });  
    
    const toCurrencyIndex = balance.currencies.findIndex((c) => c.currency === toCurrency);  
    const fromCurrencyIndex = balance.currencies.findIndex((c) => c.currency === fromCurrency);  
  
    if (fromCurrencyIndex === -1 || balance.currencies[fromCurrencyIndex].amount < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    try {
      const response = await axios.get(url, { headers: { 'apikey': process.env.EXCHANGE_RATE_KEY }});
      exchangeRate = Object.values(response.data.rates)[0]; 
    } catch (error) { 
      res.status(401).json({ success: false, message: 'Invalid access key' });
    }
    
    const toAmount = amount * exchangeRate;    
    balance.currencies[fromCurrencyIndex].amount -= amount;

    if (toCurrencyIndex === -1) { 
      balance.currencies.push({ currency: toCurrency, amount: Math.floor(toAmount)});
    } else { 
      balance.currencies[toCurrencyIndex].amount += Math.floor(toAmount);
    }
 
    await balance.save();
 
    const exchange = new ExchangesSchema({
      amount,
      fromCurrency, 
      toCurrency,
      user: req.userId,
    });

    const exchangeData = await exchange.save(); 
    res.status(200).json({ message: 'Exchange has been successfully completed.', data: exchangeData });

  } catch (error) {  
    res.status(500).json({ success: false, message: 'Exchange operation failed!' });
  }
};

module.exports = { createExchanges };
