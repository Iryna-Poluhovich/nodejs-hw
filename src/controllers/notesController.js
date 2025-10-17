import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, search, tag } = req.query;
    const skip = (page - 1) * perPage;

    // Основний фільтр — лише нотатки поточного користувача
    const notesQuery = Note.find({ userId: req.user._id });

    // Фільтр пошуку (текстовий індекс)
    if (search) {
      notesQuery.find({ $text: { $search: search } });
    }

    // Фільтр за тегом
    if (tag) {
      notesQuery.where('tag').equals(tag);
    }

    // Отримуємо кількість та самі нотатки паралельно
    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(notesQuery.getFilter()),
      notesQuery.skip(skip).limit(perPage),
    ]);

    const totalPages = Math.ceil(totalNotes / perPage);

    res.status(200).json({
      page: Number(page),
      perPage: Number(perPage),
      totalNotes,
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
      userId: req.user._id,
    });
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;

  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user._id,
    });

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
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedNote) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};
