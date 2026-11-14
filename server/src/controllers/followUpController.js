import mongoose from 'mongoose';
import FollowUp from '../models/FollowUp.js';

export async function getFollowUps(_request, response, next) {
  try {
    const followUps = await FollowUp.find().sort({ createdAt: -1 });
    return response.json(followUps);
  } catch (error) {
    return next(error);
  }
}

function isValidDateString(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  const calendarDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!calendarDate) {
    return true;
  }

  const year = Number(calendarDate[1]);
  const month = Number(calendarDate[2]);
  const day = Number(calendarDate[3]);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

export async function createFollowUp(request, response, next) {
  const { title, customerName, description, dueDate } = request.body ?? {};
  const errors = {};

  if (typeof title !== 'string' || title.trim() === '') {
    errors.title = 'Title is required.';
  }

  if (typeof customerName !== 'string' || customerName.trim() === '') {
    errors.customerName = 'Customer name is required.';
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.description = 'Description must be a string.';
  }

  const validDueDate = isValidDateString(dueDate);
  const parsedDueDate = validDueDate ? new Date(dueDate) : null;
  if (!validDueDate) {
    errors.dueDate = 'A valid due date is required.';
  }

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({ error: 'Please correct the following fields.', details: errors });
  }

  try {
    const followUp = await FollowUp.create({
      title: title.trim(),
      customerName: customerName.trim(),
      description: description?.trim() ?? '',
      dueDate: parsedDueDate,
    });

    return response.status(201).json(followUp);
  } catch (error) {
    return next(error);
  }
}

export async function updateFollowUp(request, response, next) {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(404).json({ error: 'Follow-up not found.' });
  }

  try {
    const followUp = await FollowUp.findById(id);
    if (!followUp) {
      return response.status(404).json({ error: 'Follow-up not found.' });
    }

    const { title, customerName, description, dueDate } = request.body ?? {};
    const errors = {};

    if (typeof title !== 'string' || title.trim() === '') {
      errors.title = 'Title is required.';
    }

    if (typeof customerName !== 'string' || customerName.trim() === '') {
      errors.customerName = 'Customer name is required.';
    }

    if (description !== undefined && typeof description !== 'string') {
      errors.description = 'Description must be a string.';
    }

    const validDueDate = isValidDateString(dueDate);
    if (!validDueDate) {
      errors.dueDate = 'A valid due date is required.';
    }

    if (Object.keys(errors).length > 0) {
      return response.status(400).json({ error: 'Please correct the following fields.', details: errors });
    }

    followUp.title = title.trim();
    followUp.customerName = customerName.trim();
    followUp.description = description?.trim() ?? '';
    followUp.dueDate = new Date(dueDate);

    const updatedFollowUp = await followUp.save();
    return response.json(updatedFollowUp);
  } catch (error) {
    return next(error);
  }
}

export async function deleteFollowUp(request, response, next) {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid follow-up ID.' });
  }

  try {
    const deletedFollowUp = await FollowUp.findByIdAndDelete(id);

    if (!deletedFollowUp) {
      return response.status(404).json({ error: 'Follow-up not found.' });
    }

    return response.json({ message: 'Follow-up deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}
