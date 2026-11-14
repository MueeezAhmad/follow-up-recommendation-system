import { useState } from 'react';
import { createFollowUp } from './services/followUpService.js';

const emptyForm = {
  title: '',
  customerName: '',
  description: '',
  dueDate: '',
};

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await createFollowUp(form);
      setForm(emptyForm);
      setMessage({ type: 'success', text: 'Follow-up created successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Create a follow-up</h1>
      <p>Record a follow-up task for a customer.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title <span aria-hidden="true">*</span></label>
        <input id="title" name="title" value={form.title} onChange={handleChange} required />

        <label htmlFor="customerName">Customer name <span aria-hidden="true">*</span></label>
        <input id="customerName" name="customerName" value={form.customerName} onChange={handleChange} required />

        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" value={form.description} onChange={handleChange} rows="4" />

        <label htmlFor="dueDate">Due date <span aria-hidden="true">*</span></label>
        <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create follow-up'}
        </button>
      </form>

      {message && (
        <p className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}
    </main>
  );
}
