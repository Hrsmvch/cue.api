const NotesModel = require('../models/Notes');
const NotesCategoriesModel = require('../models/NotesCategories'); 
const { ObjectId } = require('mongodb');

const create = async (req, res) => {
  try {
    const category = await NotesCategoriesModel.findOne({ user: req.userId });   
  
    const doc = new NotesModel({
      title: req.body.title,
      content: req.body.content,
      category: {id: req.body.category, title: category.categories.id(req.body.category).name},
      pinned: req.body.pinned,
      user: req.userId,
    }) 
     
    const note = await doc.save() 
    
    if(note){
      category.categories.id(req.body.category).noteCount++;  
      await category.save(); 
    } 

    res.status(201).json({ message: 'Note created successfully', data: note });

  } catch (error) {   
    console.log('error: ', error);
    res.status(500).json({ message: 'Failed to create note' });
  }
}
 
// const update = async (req, res) => {
//   try {
//     const note = await NotesModel.findByIdAndUpdate(
//       { _id: req.params.id}, {$set:req.body}, {new: true}); 
//       if (!note) {
//         return res.status(404).json({ message: 'Note not found' });
//      }

//      res.status(200).json({ message: "Note updated successfully", data: note });
//   } catch (error) { 
//     res.status(500).json({ message: "Failed to update note" });
//   }
// }

const update = async (req, res) => {
  try {
    const note = await NotesModel.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const category = await NotesCategoriesModel.findOne({ user: req.userId });
    const newCategory = category.categories.id(req.body.category);

    if (!newCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    note.title = req.body.title;
    note.content = req.body.content;
    note.category = { id: req.body.category, title: newCategory.name };
    note.pinned = req.body.pinned;

    const updatedNote = await note.save();

    res.status(200).json({ message: 'Note updated successfully', data: updatedNote });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note' });
  }
};


const getAll = async (req, res) => {
  try {
    let query = { user: req.userId };
    if (req.query.cat) query['category.id'] = req.query.cat;
  
    const notes = await NotesModel.find(query).populate('user').sort({ updatedAt: -1 }).exec();
    res.status(200).json({ message: 'Notes retrieved successfully', data: {notes: notes, count: notes.length} });
 
  } catch (error) {  
    res.status(500).json({ message: "Failed to get notes" });
  }
}

const getOne = async (req, res) => {
  try {
    const note = await NotesModel.findOne({ _id: req.params.id}); 
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ message: 'Note retrieved successfully', data: note });
  } catch (error) { 
    res.status(500).json({ message: "Failed to get note" });
  }
}

const getLast = async (req, res) => {
  try {
    let query = { user: req.userId };

    const note = await NotesModel.findOne(query)
      .populate('user')
      .sort({ updatedAt: -1 })
      .exec();

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ message: 'Last note retrieved successfully', data: note }); 
  } catch (error) { 
    res.status(500).json({ message: 'Failed to get the last note' });
  }
};

 
const remove = async (req, res) => {
  try{ 
    const note = await NotesModel.findOne({ _id: req.params.id, user: req.userId });
    
    const noteCatId = await note.category.id;  
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    } 

    const category = await NotesCategoriesModel.findOne({ user: req.userId });  
    const categoryToUpdate = category.categories.find(cat => cat._id.toString() === noteCatId.toString());

    if (!categoryToUpdate) {
      return res.status(500).json({ message: 'Category not found' });
    }
    
    categoryToUpdate.noteCount--; 

    await category.save();
    await NotesModel.findByIdAndDelete(req.params.id);
 
    res.status(200).json({ message: 'Note has been successfully removed!', data: note });

  }catch(err){  
    res.status(500).json({ message: "Failed to remove note" });
  }
}

module.exports = { create, getAll, getOne, getLast, remove, update };
