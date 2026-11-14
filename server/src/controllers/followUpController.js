import FollowUp from '../models/FollowUp.js';

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
