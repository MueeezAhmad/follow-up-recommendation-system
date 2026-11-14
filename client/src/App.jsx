import { useEffect, useState } from 'react';
import { createFollowUp, deleteFollowUp, getFollowUps, updateFollowUp } from './services/followUpService.js';

const emptyForm = {
  title: '',
  customerName: '',
  description: '',
  dueDate: '',
};

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(true);
  const [followUpsError, setFollowUpsError] = useState('');
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    async function loadFollowUps() {
      try {
        const savedFollowUps = await getFollowUps();
        setFollowUps(savedFollowUps);
      } catch (error) {
        setFollowUpsError(error.message);
      } finally {
        setIsLoadingFollowUps(false);
      }
    }

    loadFollowUps();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleEdit() {
    if (!selectedFollowUp) {
      return;
    }

    setForm({
      title: selectedFollowUp.title,
      customerName: selectedFollowUp.customerName,
      description: selectedFollowUp.description ?? '',
      dueDate: new Date(selectedFollowUp.dueDate).toISOString().slice(0, 10),
    });
    setEditingId(selectedFollowUp._id);
    setMessage(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
  }

  async function handleDelete() {
    if (!selectedFollowUp) {
      return;
    }

    const confirmed = window.confirm(`Delete "${selectedFollowUp.title}"?`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      await deleteFollowUp(selectedFollowUp._id);
      setFollowUps((currentFollowUps) => currentFollowUps.filter(
        (followUp) => followUp._id !== selectedFollowUp._id,
      ));
      setSelectedFollowUp(null);
      setMessage({ type: 'success', text: 'Follow-up deleted successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (editingId) {
        const updatedFollowUp = await updateFollowUp(editingId, form);
        setFollowUps((currentFollowUps) => currentFollowUps.map((followUp) => (
          followUp._id === editingId ? updatedFollowUp : followUp
        )));
        setSelectedFollowUp(updatedFollowUp);
        setMessage({ type: 'success', text: 'Follow-up updated successfully.' });
      } else {
        const createdFollowUp = await createFollowUp(form);
        setFollowUps((currentFollowUps) => [createdFollowUp, ...currentFollowUps]);
        setMessage({ type: 'success', text: 'Follow-up created successfully.' });
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Follow-up Recommendation System</h1>
      <h2>{editingId ? 'Edit a follow-up' : 'Create a follow-up'}</h2>
      <p>{editingId ? 'Update the selected follow-up.' : 'Record a follow-up task for a customer.'}</p>

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
          {isSubmitting ? (editingId ? 'Saving…' : 'Creating…') : (editingId ? 'Save changes' : 'Create follow-up')}
        </button>
        {editingId && (
          <button className="secondary-button" type="button" onClick={handleCancelEdit} disabled={isSubmitting}>
            Cancel edit
          </button>
        )}
      </form>

      {message && (
        <p className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      <section className="follow-ups" aria-labelledby="follow-ups-heading">
        <h2 id="follow-ups-heading">Saved follow-ups</h2>
        {isLoadingFollowUps && <p role="status">Loading follow-ups…</p>}
        {!isLoadingFollowUps && followUpsError && <p className="message error" role="alert">{followUpsError}</p>}
        {!isLoadingFollowUps && !followUpsError && followUps.length === 0 && (
          <p>No follow-ups have been created yet.</p>
        )}
        {!isLoadingFollowUps && !followUpsError && followUps.length > 0 && (
          <ul className="follow-up-list">
            {followUps.map((followUp) => (
              <li key={followUp._id}>
                <button
                  className="follow-up-card"
                  type="button"
                  aria-pressed={selectedFollowUp?._id === followUp._id}
                  disabled={Boolean(editingId) || isDeleting}
                  onClick={() => setSelectedFollowUp(followUp)}
                >
                  <span className="follow-up-card-title">{followUp.title}</span>
                  <span className="follow-up-card-line"><strong>Customer:</strong> {followUp.customerName}</span>
                  <span className="follow-up-card-line"><strong>Due date:</strong> {new Date(followUp.dueDate).toLocaleDateString()}</span>
                  <span className="follow-up-card-line"><strong>Status:</strong> {followUp.status}</span>
                </button>
                {selectedFollowUp?._id === followUp._id && (
                  <section className="follow-up-details" aria-labelledby="details-heading">
                    <h2 id="details-heading">Follow-up details</h2>
                    <h3>{followUp.title}</h3>
                    <p><strong>Customer name:</strong> {followUp.customerName}</p>
                    <p><strong>Description:</strong> {followUp.description?.trim() || 'No description provided.'}</p>
                    <p><strong>Due date:</strong> {new Date(followUp.dueDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {followUp.status}</p>
                    {!editingId && (
                      <>
                        <button type="button" onClick={handleEdit}>Edit follow-up</button>
                        <button className="danger-button" type="button" onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? 'Deleting…' : 'Delete follow-up'}
                        </button>
                      </>
                    )}
                  </section>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
