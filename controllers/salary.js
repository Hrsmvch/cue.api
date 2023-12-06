const SalaryModel = require('../models/Salary');
const BalanceModel = require('../models/Balance');

const addSalary = async (req, res) => {
  try {
    const { amount, currency, currencySymbol } = req.body;
    const salary = new SalaryModel({
      amount,
      currency,
      currencySymbol, 
      user: req.userId,
    }); 

    let balance = await BalanceModel.findOne({ user: req.userId }); 
    
    if (balance) { 
      const currencyIndex = balance.currencies.findIndex((c) => c.currency === currency);
      
      if (currencyIndex > -1) { 
        balance.currencies[currencyIndex].amount += amount;
      } else { 
        balance.currencies.push({ currency, amount });
      }
      
      await balance.save();
    } else { 
      balance = await BalanceModel.create({
        currencies: [{ currency, amount }],
        user: req.userId
      });
    } 
    
    const salaryData = await salary.save();
    res.status(201).json({ message: 'Salary successfully added!', data: salaryData });

  } catch (error) {  
    res.status(500).json({ message: 'Failed to add salary' });
  }
};

module.exports = { addSalary };
