const NotesCategoriesModel = require('../models/NotesCategories')
 
const create = async (req, res) => {
  try {  
    const existingCategory = await NotesCategoriesModel.findOne({ user: req.userId });
     
    if (existingCategory && existingCategory.categories.some(category => category.name === req.body.name)) {
      return res.status(404).json({ message: 'Category with this name already exists' });
    }
    
    const category = { name: req.body.name, noteCount: 0 };
    existingCategory.categories.push(category);
    await existingCategory.save();

    res.status(201).json({ message: 'Category created successfully', data: category });

  } catch (error) { 
    res.status(500).json({ message: 'Failed to create category' });
  }
};
 
const update = async (req, res) => {
  try { 

    const categoryId = req.params.id;
    const categoryName = req.body.name;

    const existingCategory = await NotesCategoriesModel.findOne({ user: req.userId });

    const categoryByID = existingCategory.categories.find(cat => cat._id.toString() === categoryId);
 
    if (
      existingCategory &&
      existingCategory.categories.some(
        category => category.name === req.body.name && category._id.toString() !== categoryId
      )
    ) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    
    const doc = await NotesCategoriesModel.findOneAndUpdate(
      { "categories._id": categoryId, user: req.userId },
      { $set: { "categories.$.name": categoryName } },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully", data: doc });
 
  } catch (error) { 
    res.status(500).json({ message: "Failed to update category" });
  }
}
 
const getAll = async (req, res) => {
  try { 
    const categories = await NotesCategoriesModel.find({ user: req.userId }); 

    res.status(200).json({ message: 'Categories retrieved successfully', data: categories[0].categories });
  } catch (error) { 
    res.status(500).json({ message: 'Failed to get categories' });
  }
}
 
const getOne = async (req, res) => {
  try { 
    const category = await NotesCategoriesModel.findOne(
      { user: req.userId },
      { categories: { $elemMatch: { _id: req.params.id } } }
    ).lean();

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category retrieved successfully', data: category });

  } catch (error) { 
    res.status(500).json({ message: 'Failed to get category' });
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

    res.status(200).json({ message: 'Category removed successfully', data: category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove category' });
  }
}

module.exports = { create, update, getAll, getOne, remove };
