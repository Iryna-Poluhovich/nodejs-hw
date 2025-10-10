import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from "mongoose";
import { TAGS } from '../constants/tags.js';

export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().min(1).max(30).default(1).required(),
    perPage: Joi.number().min(5).max(20).default(10).required(),
    tag: Joi.string().valid(...TAGS).required(),
    search: Joi.string().allow(''),
  }),
  };

const objectIdValidator = Joi.string().custom((value, helpers) => {
  const isValidId = isValidObjectId(value);
  return !isValidId ? helpers.message("Invalid id format!") : value;
});

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const createNoteSchema = {
   [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow(''),
    tag: Joi.string().valid(...TAGS).required(),
      }),
}

export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
 [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow(''),
    tag: Joi.string().valid(...TAGS).required(),
      }),
};
