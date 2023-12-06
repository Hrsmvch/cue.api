const ExpenseModel = require('../models/Expenses'); 
const CategoryModel = require('../models/ExpensesCategories');
const BalanceModel = require('../models/Balance');

const mongoose = require('mongoose'); 
const { ObjectId } = require('mongodb');
 
const create = async (req, res) => {
  
  try {
    const transactions = [];
    const { transactions: reqTransactions } = req.body;  
    const balance = await BalanceModel.findOne({ user: req.userId });  

    const majorCurrency = balance.currencies.find(c => c.currency === balance.majorCurrency.currency); 

    for (const item of reqTransactions) { 
      const categoryData = await CategoryModel.findOne(
        { user: req.userId },
        { categories: { $elemMatch: { _id: item.categoryId } } }
        ).lean();
          
      const doc = new ExpenseModel({
        amount: item.amount,
        paymentDate: new Date(item.paymentDate), 
        category: {
          id: categoryData.categories[0]._id,
          name: categoryData.categories[0].name
        },
        comment: item.comment,
        user: req.userId,
      }); 
      
      transactions.push(doc.save());
    } 
    
    majorCurrency.amount -= reqTransactions.reduce((acc, item) => acc + item.amount, 0);
    await balance.save();

    const createdTransactions = await Promise.all(transactions);
    res.status(201).json({ message: 'Transaction(s) created successfully', data: createdTransactions });
  } catch (error) {    
    res.status(500).json({ message: 'Failed to create transaction!' });
  }
};

const getLast = async (req, res) => {
  try { 
    const balance = await BalanceModel.findOne({ user: req.userId });  
    
    const transactions = await ExpenseModel.find({user: req.userId}).sort({ createdAt: -1 }).limit(5); 
    const majorCurrency = balance.currencies.find(c => c.currency === balance.majorCurrency.currency);  

    const updatedTransaction = transactions.map((obj) => {   
      return { currencySymbol: majorCurrency.symbol,  ...obj._doc} 
    }) 
    res.status(200).json({ message: "Last transactions retrieved successfully", data: updatedTransaction });

  } catch (error) {   
    res.status(500).json({ message: "Failed retrieving transactions!" });
  }
}
 
const update = async (req, res) => { 

  try { 
    const transaction = await ExpenseModel.findByIdAndUpdate({ _id: req.params.id}, {$set:req.body}, {new: true});
    if (!transaction) {
      return res.status(404).json({message: 'Transaction not found!'})
    } 

    res.status(200).json({ message: "Transaction updated successfully", data: transaction });

  } catch (error) { 
    res.status(500).json({ message: "Failed to update transaction" });
  }
}
 
const remove = async (req, res) => {
  try {
    const balance = await BalanceModel.findOne({ user: req.userId });  
    const majorCurrency = balance.currencies.find(c => c.currency === balance.majorCurrency.currency); 

    const transaction = await ExpenseModel.findByIdAndDelete(req.params.id); 
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
 
    majorCurrency.amount += transaction.amount;
    await balance.save();

    res.status(200).json({ message: 'Transaction has been successfully removed!', data: transaction });

  } catch (error) { 
    res.status(500).json({ message: "Failed to remove transaction!" });
  }
}
 
const getByCats = async (req, res) => {
  try {
    const categoriesObject = await CategoryModel.find({ user: req.userId });    
   
    const month = req.query.month || new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const startOfMonth = new Date(`${year}-${month}-01`);
    const endOfMonth = new Date(year, month, 0);

    const transactions = await ExpenseModel.find({
      user: req.userId,
      paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
    });   

    const result = [];  
    for (const cat of categoriesObject[0].categories) {  
      const catTransactions = transactions.filter(
        transaction => transaction.category.id.toString() === cat._id.toString()
        ); 
         
      const expenseSum = catTransactions.reduce((acc, transaction) => { 
        return acc + transaction.amount;
      }, 0); 

      result.push({
        category: cat,
        expenseSum: expenseSum
      });
    }  
     
    res.status(200).json({ message: 'Expenses by categories retrieved successfully', data: result.sort((a, b) => {
      if (a.category.name === "Other") return 1;
      if (b.category.name === "Other") return -1;
      return a.category.name.localeCompare(b.category.name);
    }) }); 

  } catch (error) {  
    res.status(500).json({ message: 'Failed to retrieve transactions by category' });
  }
};

const lastWeek = async (req, res) => { 
  try {
    const dateArray = [];
    const today = new Date();
    // today.setHours(0, 0, 0, 0); 
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
    
    const balance = await BalanceModel.findOne({ user: req.userId });   
    const majorCurrency = balance.currencies.find(c => c.currency === balance.majorCurrency.currency);  

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today); 
      currentDate.setDate(today.getDate() - i);
      const dateString = currentDate.toISOString().split('T')[0];  
      const startDate = new Date(dateString + 'T00:00:00.000Z');
      const endDate = new Date(dateString + 'T23:59:59.999Z');
      dateArray.push({startDate, endDate});
    }
   
    const ExchangesData = [];
    for (let i = 0; i < dateArray.length; i++) {
      const result = await ExpenseModel.aggregate([
        { $match: { user: new ObjectId(req.userId), paymentDate: { $gte: dateArray[i].startDate,  $lte: dateArray[i].endDate } } },
        { $group: { _id: null, amount: { $sum: { $toDouble: '$amount' } } } },
        { $project: { _id: 0, amount: 1, paymentDate: dateArray[i].startDate } }
      ]);
    
      if (result.length > 0) {
        ExchangesData.push(result[0]);
      } else {
        ExchangesData.push({ amount: 0, paymentDate: dateArray[i].startDate });
      }
    } 

    const sumOfTransactions = await ExpenseModel.aggregate([
      { $match: { user: new ObjectId(req.userId), paymentDate: { $gte: sevenDaysAgo, $lte: today } } },
      { $group: { _id: null, totalAmount: { $sum: { $toDouble: "$amount" } } } },
      { $project: { _id: 0, period: {startData: sevenDaysAgo, endData: today}, totalAmount: 1, currencySymbol: majorCurrency.symbol } }
    ]);
        
    const collectedData = { 
      sumOfTransactions: sumOfTransactions,
      sumByDays:  ExchangesData.sort((a, b) => a.paymentDate - b.paymentDate)
    } 
    
    res.status(200).json({data: collectedData, message: 'Last week transactions retrieved successfully' });
  } catch (error) { 
    res.status(500).json({ message: 'Failed to get transactions!' }); 
  }
};

const getByCatOfYear = async (req, res) => {
  try { 
    const categoryId = req.params.id; 
    const year = req.params.year || new Date().getFullYear();  
    const transactions = await ExpenseModel.find({ user: req.userId, ['category.id']: new ObjectId(categoryId), paymentDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } }); 
  
    const result = []; 
    for (const month of Array.from({ length: 12 }, (_, i) => i + 1)) { 
      const monthName = new Date(year, month - 1).toLocaleString('en', { month: 'long' }); 
      const monthTransactions = transactions.filter(transaction => transaction.paymentDate.getMonth() === month - 1);
      const expenseSum = monthTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);
      result.push({ month: monthName, amount: expenseSum });
    }
     
    const categoriesObject = await CategoryModel.find({ user: req.userId });  
    const categoryInfo = categoriesObject[0]?.categories?.find(el => el._id == categoryId)
  
    res.status(200).json({
      data: {category: categoryInfo, categoryData: result}, 
      message: 'Months transactions of the year retrieved successfully' });
  
  } catch (error) { 
    res.status(500).json({ message: 'Failed to retrieve expenses by category of the year' });
  }
}; 
 
module.exports = { create, getLast, update, remove, getByCats, getByCatOfYear, lastWeek };
