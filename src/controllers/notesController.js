import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, search, tag } = req.query;
    const skip = (page - 1) * perPage;
    const filter = { userId: req.user._id };
    const notesQuery = Note.find();

    if (search) {
      filter.$text = { $search: search };
      // notesQuery.where({
      //   filter.$text: { $search: search },
      // });
    }

    if (tag) {
       filter.tag = tag;
      // notesQuery.where('tag').equals(tag);
    }

    // Виконуємо запити паралельно
    const [totalItems, notes] = await Promise.all([
      notesQuery.clone().countDocuments(),
      notesQuery(filter).skip(skip).limit(perPage),
    ]);

    const totalPages = Math.ceil(totalItems / perPage);

    res.status(200).json({
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;


  try {
    const note = await Note.findOne({ _id: noteId, userId: req.user._id });

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const newNote = await Note.create({
      ...req.body,
    userId: req.user._id,});
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;

  try {
    const deletedNote = await Note.findOneAndDelete({ _id: noteId,  userId: req.user._id, });

    if (!deletedNote) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(deletedNote);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;

  try {
    const updatedNote = await Note.findOneAndUpdate({ _id: noteId }, req.body, {
      new: true,
    });

    if (!updatedNote) {
     return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

// // Допоміжна функція для 404
// const getNotFoundById = (noteId) => {
//   return createHttpError(404, `Note not found by id ${noteId}`);
// };
