import { useEffect, useRef, useState } from 'react';
import { completeFollowUp, createFollowUp, deleteFollowUp, getFollowUps, updateFollowUp } from './services/followUpService.js';

const emptyForm = {
  title: '',
  customerName: '',
  description: '',
  dueDate: '',
};

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFollowUpDateClassification(followUp, todayDateKey) {
  if (followUp.status !== 'Pending') {
    return null;
  }

  const dueDateKey = followUp.dueDate.slice(0, 10);
  if (dueDateKey === todayDateKey) {
    return 'Due';
  }

  if (dueDateKey > todayDateKey) {
    return 'Upcoming';
  }

  if (dueDateKey < todayDateKey) {
    return 'Overdue';
  }

  return null;
}

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [message, setMessage] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(true);
  const [followUpsError, setFollowUpsError] = useState('');
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const selectedFollowUpRef = useRef(null);
  const todayDateKey = getLocalDateKey(new Date());
  const filteredFollowUps = statusFilter === 'All'
    ? followUps
    : followUps.filter((followUp) => followUp.status === statusFilter);
  const isSelectedFollowUpVisible = filteredFollowUps.some(
    (followUp) => followUp._id === selectedFollowUp?._id,
  );

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

  useEffect(() => {
    if (!selectedFollowUp || !isSelectedFollowUpVisible) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (selectedFollowUpRef.current && !selectedFollowUpRef.current.contains(event.target)) {
        setSelectedFollowUp(null);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [selectedFollowUp, isSelectedFollowUpVisible]);

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

  async function handleComplete() {
    if (!selectedFollowUp || selectedFollowUp.status !== 'Pending') {
      return;
    }

    setIsCompleting(true);
    setMessage(null);

    try {
      const completedFollowUp = await completeFollowUp(selectedFollowUp._id);
      setFollowUps((currentFollowUps) => currentFollowUps.map((followUp) => (
        followUp._id === completedFollowUp._id ? completedFollowUp : followUp
      )));
      setSelectedFollowUp(completedFollowUp);
      setMessage({ type: 'success', text: 'Follow-up marked as completed.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsCompleting(false);
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
        {!isLoadingFollowUps && !followUpsError && (
          <>
            <div className="status-filter">
              <label htmlFor="statusFilter">Filter by status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {followUps.length === 0 && <p>No follow-ups have been created yet.</p>}
            {followUps.length > 0 && filteredFollowUps.length === 0 && (
              <p>No {statusFilter.toLowerCase()} follow-ups found.</p>
            )}
            {filteredFollowUps.length > 0 && (
              <ul className="follow-up-list">
                {filteredFollowUps.map((followUp) => {
              const dateClassification = getFollowUpDateClassification(followUp, todayDateKey);

              return (
              <li
                key={followUp._id}
                ref={selectedFollowUp?._id === followUp._id ? selectedFollowUpRef : null}
              >
                <button
                  className="follow-up-card"
                  type="button"
                  aria-pressed={selectedFollowUp?._id === followUp._id}
                  disabled={Boolean(editingId) || isDeleting}
                  onClick={() => setSelectedFollowUp((current) => (
                    current?._id === followUp._id ? null : followUp
                  ))}
                >
                  <span className="follow-up-card-title">
                    {followUp.title}
                    {dateClassification && (
                      <span className={`${dateClassification.toLowerCase()}-badge`}>
                        {dateClassification}
                      </span>
                    )}
                  </span>
                  <span className="follow-up-card-line"><strong>Customer:</strong> {followUp.customerName}</span>
                  <span className="follow-up-card-line"><strong>Due date:</strong> {followUp.dueDate.slice(0, 10)}</span>
                  <span className="follow-up-card-line"><strong>Status:</strong> {followUp.status}</span>
                </button>
                {selectedFollowUp?._id === followUp._id && (
                  <section className="follow-up-details" aria-labelledby="details-heading">
                    <h2 id="details-heading">Follow-up details</h2>
                    <h3>{followUp.title}</h3>
                    <p><strong>Customer name:</strong> {followUp.customerName}</p>
                    <p><strong>Description:</strong> {followUp.description?.trim() || 'No description provided.'}</p>
                    <p><strong>Due date:</strong> {followUp.dueDate.slice(0, 10)}</p>
                    <p><strong>Status:</strong> {followUp.status}</p>
                    {!editingId && (
                      <>
                        {followUp.status === 'Pending' && (
                          <button type="button" onClick={handleComplete} disabled={isCompleting}>
                            {isCompleting ? 'Marking completed…' : 'Mark as Completed'}
                          </button>
                        )}
                        <button type="button" onClick={handleEdit}>Edit follow-up</button>
                        <button className="danger-button" type="button" onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? 'Deleting…' : 'Delete follow-up'}
                        </button>
                      </>
                    )}
                  </section>
                )}
              </li>
              );
            })}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
}
