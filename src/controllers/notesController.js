import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, search, tag } = req.query;
    const skip = (page - 1) * perPage;

    const notesQuery = Note.find();

    if (search) {
      notesQuery.where({
        $text: { $search: search },
      });
    }

    if (tag) {
      notesQuery.where('tag').equals(tag);
    }

    // Виконуємо запити паралельно
    const [totalItems, notes] = await Promise.all([
      notesQuery.clone().countDocuments(),
      notesQuery.skip(skip).limit(perPage),
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
    const note = await Note.findById(noteId);

    if (!note) {
      next(getNotFoundById(noteId));
      return;
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const newNote = await Note.create(req.body);
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;

  try {
    const deletedNote = await Note.findOneAndDelete({ _id: noteId });

    if (!deletedNote) {
      next(getNotFoundById(noteId));
      return;
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
      next(getNotFoundById(noteId));
      return;
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

// Допоміжна функція для 404
const getNotFoundById = (noteId) => {
  return createHttpError(404, `Note not found by id ${noteId}`);
};
