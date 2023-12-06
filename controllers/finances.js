const BalanceModel = require('../models/Balance');
const SalaryModel = require('../models/Salary');
const ExpensesModel = require('../models/Expenses');

const { ObjectId } = require('mongodb');
const axios = require('axios');


const getBalanceByMonth = async (req, res) => { 
  try {  
    const month = req.query.month || new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const startOfMonth = new Date(`${year}-${month}-01`);  
    const endOfMonth = new Date(year, month, 0);      

    const salaryData = await SalaryModel.aggregate([
      { $match: { user: new ObjectId(req.userId), createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: {
          _id: { currency: '$currency', symbol: '$currencySymbol' },
          amount: { $sum: '$amount' }
        }},
      { $project: {
          _id: 0,
          currency: '$_id.currency',
          currencySymbol: '$_id.symbol',
          amount: 1
        }}
    ]);
 
    let sumOfSalaries = 0
    const balance = await BalanceModel.findOne({ user: req.userId }); 

    for (const element of salaryData) {
      const url = `https://api.apilayer.com/exchangerates_data/latest?symbols=${balance.majorCurrency.currency}&base=${element.currency}`;
  
      try {
        const response = await axios.get(url, { headers: { 'apikey': process.env.EXCHANGE_RATE_KEY }});
        sumOfSalaries += Object.values(response.data.rates)[0] * element.amount; 
      } catch (error) {  
        res.status(401).json({ success: false, message: 'Invalid access key' });
      } 
    };
      
    const expenseData = await ExpensesModel.aggregate([
      { $match: { user: new ObjectId(req.userId), paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      { $project: { _id: 0, amount: '$totalAmount' } }
    ]); 

    const collectedData = {
      salary: {amount: sumOfSalaries.toFixed(0), symbol: balance.majorCurrency.symbol}, 
      expanses: {amount: expenseData[0]?.amount?.toFixed(0) || 0, symbol: balance.majorCurrency.symbol}, 
      saving: {amount: sumOfSalaries.toFixed(0) - expenseData[0]?.amount, symbol: balance.majorCurrency.symbol}
    }
 
    res.status(200).json({ message: 'Current balance retrieved successfully', data: collectedData });
      
  } catch (error) {  
    res.status(500).json({ message: "Failed to get current balance" });
  } 
}; 

const getBalance = async (req, res) => {
  try {
    const balance = await BalanceModel.findOne({ user: req.userId }); 
    if (balance) { 
      res.status(200).json({ message: 'Total balance retrieved successfully', data: balance });
    } else { 
      const defaultCurrencies = [
        {currency: 'EUR', symbol: '€', amount: 0}, 
        {currency: 'USD', symbol: '$', amount: 0}, 
        {currency: 'UAH', symbol: '₴', amount: 0}
      ]

      balance = await BalanceModel.create({
        currencies: defaultCurrencies,
        majorCurrency: '',
        user: req.userId
      });
      await balance.save();
      res.status(200).json({ message: 'Total balance retrieved successfully', data: {currentBalance: balance.currencies} });
    } 
    
  } catch (error) {
    res.status(500).json({ message: "Failed to get total balance" });
  }
};

const updateBalance = async (req, res) => {
  try {
    const { currenciesToAdd, currenciesToRemove, currencyUpdates } = req.body;

    const balance = await BalanceModel.findOne({ user: req.userId });
    if (!balance) {
      return res.status(404).json({ message: 'Balance not found' });
    }

    const { currencies: currentCurrencies } = balance;
 
     // Add currencies
    if (currenciesToAdd && currenciesToAdd.length > 0) {
      for (const currency of currenciesToAdd) {
        const { currency: currencyCode, symbol, amount } = currency;
 
        const existingCurrency = currentCurrencies.find((c) => c.currency === currencyCode); 
        if (existingCurrency) {
          return res.status(400).json({ message: `Currency ${currencyCode} already exists in the balance` });
        }
 
        currentCurrencies.push({ currency: currencyCode, symbol, amount });
      }
    }

    // Remove currencies
    if (currenciesToRemove && currenciesToRemove.length > 0) {
      for (const currencyCode of currenciesToRemove) { 

        const currencyIndex = currentCurrencies.findIndex((c) => c.currency === currencyCode);
        if (currencyIndex === -1) {
          return res.status(400).json({ message: `Currency ${currencyCode} does not exist in the balance` });
        }
 
        currentCurrencies.splice(currencyIndex, 1);
      }
    }

    // Update currency amounts
    if (currencyUpdates && currencyUpdates.length > 0) {
      for (const update of currencyUpdates) {
        const { currency, amount } = update;
 
        const currencyToUpdate = currentCurrencies.find((c) => c.currency === currency); 
        if (currencyToUpdate) currencyToUpdate.amount = amount;
      }
    }
 
    await balance.save(); 
    res.status(200).json({ message: 'Currencies updated successfully', data: { currentBalance: balance } });
  } catch (error) { 
    res.status(500).json({ message: 'Failed to update balance' });
  }
};

const setMajorCurrency = async (req, res) => {
  try {
    const { majorCurrency } = req.body; 

    const balance = await BalanceModel.findOne({ user: req.userId });  
    if (!balance) return res.status(404).json({ message: 'Balance not found' }); 
 
    const selectedCurrency = balance.currencies.find((currency) => currency.currency === majorCurrency);
    balance.majorCurrency = selectedCurrency;

    await balance.save();
    res.status(200).json({ message: 'Major currency set successfully', data: { currentBalance: balance } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to set major currency' });
  }
};

module.exports = { getBalance, updateBalance, setMajorCurrency, getBalanceByMonth };
