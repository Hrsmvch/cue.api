const NotesCategoriesModel = require('../models/ExpensesCategories');
const CategoryModel = require('../models/ExpensesCategories'); 
 
const create = async (req, res) => {
  try { 
    const existingCategory = await CategoryModel.findOne({ user: req.userId });
    if (existingCategory && existingCategory.categories.some(category => category.name === req.body.name)) {
      return res.status(404).json({ message: 'Category with this name already exists' });
    }
 
    const category = { name: req.body.name }; 
    existingCategory.categories.push(category);
    await existingCategory.save();

    res.status(201).json({ message: 'Category created successfully', data: category });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create category' });
  }
};
 
const update = async (req, res) => {
  try {   
       // Update categories
      const updatePromises = req.body.update.map(async (updatedCategory) => {
      const doc = await CategoryModel.findOneAndUpdate(
        { "categories._id": updatedCategory._id, user: req.userId },
        { $set: 
          { "categories.$.name": updatedCategory.name, "categories.$.limit": updatedCategory.limit } 
        },
        { new: true }
      );
        return doc;
      });
      const updatedCategories = await Promise.all(updatePromises);
 
       // Remove categories
       const removePromises = req.body.remove.map(async (cat_id) => { 
        const category = await NotesCategoriesModel.findOneAndUpdate(
          { user: req.userId },
          { $pull: { categories: { _id: cat_id } } },
          { new: true }
          ); 
          
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        } 
        });

        const removedCategories = await Promise.all(removePromises);
        if (!removedCategories) {
          return res.status(404).json({ message: 'Something go wrong 2' });
        } 
 
    res.status(200).json({ message: "Category updated successfully"}); 
  } catch (error) { 
    res.status(500).json({ message: error });
  }
}
 
const getAll = async (req, res) => {
  try {
    const categories = await CategoryModel.find({ user: req.userId });

    res.status(200).json({ message: 'Categories retrieved successfully', data: categories.sort((a, b) => {
      if (a.name === "Other") return 1;
      if (b.name === "Other") return -1;
      return a.name.localeCompare(b.name);
     }) });

  } catch (error) { 
    res.status(500).json({ message: 'Failed to get categories' });
  }
}

const remove = async (req, res) => {
  try {
    const category = await NotesCategoriesModel.findOneAndUpdate(
      { user: req.userId },
      { $pull: { categories: { _id: req.params.id } } },
      { new: true }
      ); 
      
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category removed successfully' });
  } catch (error) { 
    res.status(500).json({ message: 'Failed to remove category' });
  }
}

module.exports = { create, update, getAll, remove };
