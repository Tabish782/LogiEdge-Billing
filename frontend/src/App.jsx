import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'master', label: 'Master', icon: 'master' },
  { key: 'billing', label: 'Billing', icon: 'billing' },
];

const initialCustomerForm = {
  name: '',
  address: '',
  panNumber: '',
  gstNumber: '',
  status: 'active',
};

const initialItemForm = {
  name: '',
  unitPrice: '',
  status: 'active',
};

function toCustomerForm(customer) {
  return {
    name: customer.name || '',
    address: customer.address || '',
    panNumber: customer.panNumber || '',
    gstNumber: customer.gstNumber || '',
    status: customer.status || 'active',
  };
}

function toItemForm(item) {
  return {
    name: item.name || '',
    unitPrice: String(item.unitPrice || ''),
    status: item.status || 'active',
  };
}

function currency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function Sidebar({ activeView, onChange }) {
  return (
    <aside className="sidebar">
      <div className="brand-strip" />
      <div className="brand">Billing Dashboard</div>
      <nav className="side-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={classNames('side-nav__item', activeView === item.key && 'is-active')}
            onClick={() => onChange(item.key)}
          >
            <span className={classNames('side-nav__icon', `side-nav__icon--${item.icon}`)}>
              {item.icon === 'dashboard' ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" />
                  <path d="M8.5 9.25h7" />
                  <path d="M8.5 14.75h3.5" />
                  <circle cx="17" cy="14.75" r="1.25" />
                </svg>
              ) : null}
              {item.icon === 'master' ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6.5 7.5a2.75 2.75 0 1 1 5.5 0a2.75 2.75 0 0 1-5.5 0Z" />
                  <path d="M13.5 8.25a2.25 2.25 0 1 1 4.5 0a2.25 2.25 0 0 1-4.5 0Z" />
                  <path d="M4.75 18.25c.55-2.35 2.5-4 4.95-4h.1c2.45 0 4.4 1.65 4.95 4" />
                  <path d="M13.2 18.25c.38-1.7 1.8-2.9 3.57-2.9h.07c1.77 0 3.19 1.2 3.57 2.9" />
                </svg>
              ) : null}
              {item.icon === 'billing' ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 3.75h8.75L19 7v12.25a1.75 1.75 0 0 1-1.75 1.75h-10.5A1.75 1.75 0 0 1 5 19.25V5.5A1.75 1.75 0 0 1 6.75 3.75Z" />
                  <path d="M15.75 3.75V7H19" />
                  <path d="M8 11h8" />
                  <path d="M8 14.5h8" />
                  <path d="M8 18h4.5" />
                </svg>
              ) : null}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <h3>{title}</h3>
        {action}
      </div>
      <div className="panel__body">{children}</div>
    </section>
  );
}

function StatusBadge({ status }) {
  return <span className={classNames('badge', `badge--${status}`)}>{status}</span>;
}

function MasterHome({ onNavigate, customers, items }) {
  const activeCustomers = customers.filter((customer) => customer.status === 'active').length;
  const activeItems = items.filter((item) => item.status === 'active').length;

  return (
    <div className="master-home">
      <div className="overview-grid">
        <article className="overview-card">
          <span className="overview-card__label">Customers</span>
          <strong>{customers.length}</strong>
          <p>{activeCustomers} active records</p>
        </article>
        <article className="overview-card">
          <span className="overview-card__label">Items</span>
          <strong>{items.length}</strong>
          <p>{activeItems} active records</p>
        </article>
        <article className="overview-card overview-card--accent">
          <span className="overview-card__label">Quick note</span>
          <strong>Master controls billing</strong>
          <p>Keep customer and item records updated before generating invoices.</p>
        </article>
      </div>

      <div className="grid-two">
        <button type="button" className="summary-card" onClick={() => onNavigate('customers')}>
          <span className="summary-card__icon">CU</span>
          <strong>Customer</strong>
          <span>Read, update, and manage customer master data</span>
        </button>
        <button type="button" className="summary-card" onClick={() => onNavigate('items')}>
          <span className="summary-card__icon">IT</span>
          <strong>Items</strong>
          <span>Read, update, and manage item master data</span>
        </button>
      </div>
    </div>
  );
}

function CustomerList({ customers, onAdd, onEdit, onDelete, onBack }) {
  return (
    <SectionCard
      title="Customers"
      action={
        <div className="header-actions">
          <button type="button" className="text-button" onClick={onBack}>
            Back
          </button>
          <button type="button" className="primary-button" onClick={onAdd}>
            Add
          </button>
        </div>
      }
    >
      <div className="card-grid">
        {customers.map((customer) => (
          <article key={customer.id} className="entity-card">
            <div>
              <h4>{customer.name}</h4>
              <p>{customer.address}</p>
            </div>
            <div className="entity-card__side">
              <StatusBadge status={customer.status} />
              <div className="row-actions">
                <button type="button" className="secondary-button" onClick={() => onEdit(customer)}>
                  Edit
                </button>
                <button type="button" className="ghost-button" onClick={() => onDelete(customer)}>
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}

function ItemList({ items, onAdd, onEdit, onDelete, onBack }) {
  return (
    <SectionCard
      title="Items"
      action={
        <div className="header-actions">
          <button type="button" className="text-button" onClick={onBack}>
            Back
          </button>
          <button type="button" className="primary-button" onClick={onAdd}>
            Add
          </button>
        </div>
      }
    >
      <div className="card-grid">
        {items.map((item) => (
          <article key={item.id} className="entity-card">
            <div>
              <h4>{item.name}</h4>
              <p>{currency(item.unitPrice)}</p>
            </div>
            <div className="entity-card__side">
              <StatusBadge status={item.status} />
              <div className="row-actions">
                <button type="button" className="secondary-button" onClick={() => onEdit(item)}>
                  Edit
                </button>
                <button type="button" className="ghost-button" onClick={() => onDelete(item)}>
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}

function CustomerForm({ value, onChange, onCancel, onSubmit, isSubmitting, mode = 'create' }) {
  return (
    <SectionCard title={mode === 'edit' ? 'Update Customer' : 'Add New Customer'}>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          <span>Customer name</span>
          <input
            value={value.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Customer name"
            required
          />
        </label>
        <label>
          <span>Customer address</span>
          <input
            value={value.address}
            onChange={(event) => onChange('address', event.target.value)}
            placeholder="Customer address"
            required
          />
        </label>
        <label>
          <span>Customer PAN number</span>
          <input
            value={value.panNumber}
            onChange={(event) => onChange('panNumber', event.target.value.toUpperCase())}
            placeholder="PAN number"
            required
          />
          <small>PAN format: `ABCDE1234F`</small>
        </label>
        <label>
          <span>Customer GST number</span>
          <input
            value={value.gstNumber}
            onChange={(event) => onChange('gstNumber', event.target.value.toUpperCase())}
            placeholder="GST number (optional)"
          />
          <small>Format: `22ABCDE1234F1Z5`</small>
        </label>
        <label>
          <span>Status</span>
          <select value={value.status} onChange={(event) => onChange('status', event.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <div className="form-actions">
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

function ItemForm({ value, onChange, onCancel, onSubmit, isSubmitting, mode = 'create' }) {
  return (
    <SectionCard title={mode === 'edit' ? 'Update Item' : 'Add New Item'}>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          <span>Item name</span>
          <input
            value={value.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Item name"
            required
          />
        </label>
        <label>
          <span>Customer billing price</span>
          <input
            type="number"
            min="1"
            step="1"
            value={value.unitPrice}
            onChange={(event) => onChange('unitPrice', event.target.value)}
            placeholder="Price"
            required
          />
        </label>
        <label>
          <span>Status</span>
          <select value={value.status} onChange={(event) => onChange('status', event.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <div className="form-actions">
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

function BillingLanding({ onStart }) {
  return (
    <SectionCard title="Customer Details">
      <div className="empty-state">
        <button type="button" className="add-button" onClick={onStart}>
          <span>+</span>
          <span>ADD</span>
        </button>
      </div>
    </SectionCard>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal__header">
          <h3>{title}</h3>
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer ? <div className="modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm, tone = 'danger' }) {
  return (
    <div className="confirm-backdrop">
      <div className="confirm-dialog">
        <div className="confirm-dialog__icon" data-tone={tone}>
          !
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog__actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="ghost-button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingEditor({
  customer,
  invoiceItems,
  onAddItems,
  onUpdateQuantity,
  onCancel,
  onCreate,
  isSubmitting,
}) {
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const gstRate = customer.isGstRegistered ? 0 : 18;
  const gstAmount = (subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;

  return (
    <div className="stack">
      <SectionCard title="Customer Details">
        <div className="detail-grid">
          <div>
            <span>Name</span>
            <strong>{customer.name}</strong>
          </div>
          <div>
            <span>Address</span>
            <strong>{customer.address}</strong>
          </div>
          <div>
            <span>Pan Card</span>
            <strong>{customer.panNumber}</strong>
          </div>
          <div>
            <span>GST Num</span>
            <strong>{customer.gstNumber || 'Not registered'}</strong>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Items"
        action={
          <button type="button" className="add-button add-button--small" onClick={onAddItems}>
            <span>+</span>
            <span>ADD</span>
          </button>
        }
      >
        {invoiceItems.length === 0 ? (
          <div className="empty-inline">No items selected yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item) => (
                <tr key={item.itemId}>
                  <td>{item.name}</td>
                  <td>
                    <div className="stepper">
                      <button type="button" onClick={() => onUpdateQuantity(item.itemId, item.quantity - 1)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                  </td>
                  <td>{currency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td />
                <td>Subtotal</td>
                <td>{currency(subtotal)}</td>
              </tr>
              <tr>
                <td />
                <td>GST ({gstRate}%)</td>
                <td>{currency(gstAmount)}</td>
              </tr>
              <tr className="total-row">
                <td />
                <td>Final Total</td>
                <td>{currency(total)}</td>
              </tr>
            </tbody>
          </table>
        )}
        <div className="footer-actions">
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={onCreate}
            disabled={invoiceItems.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

function InvoiceDetails({ invoice, title = 'Invoice Details', onBack }) {
  return (
    <div className="stack">
      {onBack ? (
        <button type="button" className="text-button" onClick={onBack}>
          Back
        </button>
      ) : null}
      <SectionCard title={title}>
        <div className="invoice-header">
          <div className="detail-grid">
            <div>
              <span>Name</span>
              <strong>{invoice.customer.name}</strong>
            </div>
            <div>
              <span>Address</span>
              <strong>{invoice.customer.address}</strong>
            </div>
            <div>
              <span>Pan Card</span>
              <strong>{invoice.customer.panNumber}</strong>
            </div>
            <div>
              <span>GST Num</span>
              <strong>{invoice.customer.gstNumber || 'Not registered'}</strong>
            </div>
          </div>
          <strong className="invoice-code">Invoice ID: {invoice.invoiceCode}</strong>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{currency(item.lineTotal)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td />
              <td>Subtotal</td>
              <td>{currency(invoice.subtotalAmount ?? invoice.totalAmount)}</td>
            </tr>
            <tr>
              <td />
              <td>GST ({invoice.gstRate ?? 0}%)</td>
              <td>{currency(invoice.gstAmount ?? 0)}</td>
            </tr>
            <tr className="total-row">
              <td />
              <td>Final Total</td>
              <td>{currency(invoice.totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

function Dashboard({ invoices, searchValue, onSearchChange, onView }) {
  return (
    <SectionCard title="Dashboard">
      <div className="dashboard-tools">
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by Invoice ID"
        />
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Customer name</th>
            <th>Item name(s)</th>
            <th>GST</th>
            <th>Amount</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="6">
                <div className="empty-inline">No invoices found.</div>
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoiceCode}</td>
                <td>{invoice.customerName}</td>
                <td>{invoice.itemNames}</td>
                <td>{currency(invoice.gstAmount ?? 0)}</td>
                <td>{currency(invoice.amount)}</td>
                <td>
                  <button type="button" className="primary-button primary-button--small" onClick={() => onView(invoice.id)}>
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </SectionCard>
  );
}

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [masterView, setMasterView] = useState('home');
  const [billingStage, setBillingStage] = useState('landing');
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [draftItems, setDraftItems] = useState([]);
  const [customerForm, setCustomerForm] = useState(initialCustomerForm);
  const [itemForm, setItemForm] = useState(initialItemForm);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchInvoices(dashboardSearch);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [dashboardSearch]);

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [customerData, itemData, invoiceData] = await Promise.all([
        api('/customers'),
        api('/items'),
        api('/invoices'),
      ]);

      setCustomers(customerData);
      setItems(itemData);
      setInvoices(invoiceData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvoices(search = '') {
    try {
      const data = await api(`/invoices?search=${encodeURIComponent(search)}`);
      setInvoices(data);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function showMessage(nextMessage) {
    setMessage(nextMessage);
    window.clearTimeout(showMessage.timeoutId);
    showMessage.timeoutId = window.setTimeout(() => setMessage(''), 2500);
  }

  function resetBilling() {
    setBillingStage('landing');
    setSelectedCustomer(null);
    setDraftItems([]);
    setSelectedInvoice(null);
    setIsCustomerModalOpen(false);
    setIsItemModalOpen(false);
  }

  async function handleCustomerSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const customer = await api(editingCustomerId ? `/customers/${editingCustomerId}` : '/customers', {
        method: editingCustomerId ? 'PUT' : 'POST',
        body: JSON.stringify(customerForm),
      });

      setCustomers((current) =>
        editingCustomerId
          ? current.map((entry) => (entry.id === editingCustomerId ? customer : entry))
          : [customer, ...current],
      );
      setCustomerForm(initialCustomerForm);
      setEditingCustomerId(null);
      setMasterView('customers');
      showMessage(
        editingCustomerId
          ? 'Customer updated successfully.'
          : customer.isGstRegistered
            ? 'GST customer created successfully.'
            : 'Non-GST customer created successfully.',
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleItemSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const item = await api(editingItemId ? `/items/${editingItemId}` : '/items', {
        method: editingItemId ? 'PUT' : 'POST',
        body: JSON.stringify(itemForm),
      });

      setItems((current) =>
        editingItemId
          ? current.map((entry) => (entry.id === editingItemId ? item : entry))
          : [item, ...current],
      );
      setItemForm(initialItemForm);
      setEditingItemId(null);
      setMasterView('items');
      showMessage(editingItemId ? 'Item updated successfully.' : 'Item created successfully.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCustomer(customer) {
    setPendingDelete({
      type: 'customer',
      id: customer.id,
      title: 'Delete customer?',
      message: `"${customer.name}" will be removed from master data if it is not used in any invoice.`,
      confirmLabel: 'Delete customer',
    });
  }

  async function handleDeleteItem(item) {
    setPendingDelete({
      type: 'item',
      id: item.id,
      title: 'Delete item?',
      message: `"${item.name}" will be removed from master data if it is not used in any invoice.`,
      confirmLabel: 'Delete item',
    });
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setError('');
    try {
      if (pendingDelete.type === 'customer') {
        await api(`/customers/${pendingDelete.id}`, { method: 'DELETE' });
        setCustomers((current) => current.filter((entry) => entry.id !== pendingDelete.id));
        showMessage('Customer deleted successfully.');
      } else {
        await api(`/items/${pendingDelete.id}`, { method: 'DELETE' });
        setItems((current) => current.filter((entry) => entry.id !== pendingDelete.id));
        showMessage('Item deleted successfully.');
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingDelete(null);
    }
  }

  function openBillingStart() {
    setBillingStage('landing');
    setSelectedInvoice(null);
    setIsCustomerModalOpen(true);
  }

  function chooseCustomer(customer) {
    setSelectedCustomer(customer);
    setDraftItems([]);
    setBillingStage('editor');
    setIsCustomerModalOpen(false);
  }

  function updateDraftQuantity(itemId, nextQuantity) {
    setDraftItems((current) =>
      current
        .map((item) =>
          item.itemId === itemId ? { ...item, quantity: Math.max(0, nextQuantity) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  async function handleCreateInvoice() {
    if (!selectedCustomer || draftItems.length === 0) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const invoice = await api('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          items: draftItems.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
        }),
      });

      setSelectedInvoice(invoice);
      setBillingStage('created');
      setActiveView('billing');
      await fetchInvoices(dashboardSearch);
      showMessage('Invoice created successfully.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewInvoice(invoiceId) {
    setLoading(true);
    setError('');

    try {
      const invoice = await api(`/invoices/${invoiceId}`);
      setSelectedInvoice(invoice);
      setActiveView('dashboard');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  const itemSelectionDraft = useMemo(() => {
    const map = new Map();
    draftItems.forEach((item) => {
      map.set(item.itemId, item.quantity);
    });
    return map;
  }, [draftItems]);

  function renderMasterContent() {
    if (masterView === 'customers') {
      return (
        <CustomerList
          customers={customers}
          onAdd={() => {
            setCustomerForm(initialCustomerForm);
            setEditingCustomerId(null);
            setMasterView('add-customer');
          }}
          onEdit={(customer) => {
            setCustomerForm(toCustomerForm(customer));
            setEditingCustomerId(customer.id);
            setMasterView('add-customer');
          }}
          onDelete={handleDeleteCustomer}
          onBack={() => setMasterView('home')}
        />
      );
    }

    if (masterView === 'items') {
      return (
        <ItemList
          items={items}
          onAdd={() => {
            setItemForm(initialItemForm);
            setEditingItemId(null);
            setMasterView('add-item');
          }}
          onEdit={(item) => {
            setItemForm(toItemForm(item));
            setEditingItemId(item.id);
            setMasterView('add-item');
          }}
          onDelete={handleDeleteItem}
          onBack={() => setMasterView('home')}
        />
      );
    }

    if (masterView === 'add-customer') {
      return (
        <CustomerForm
          value={customerForm}
          onChange={(field, value) => setCustomerForm((current) => ({ ...current, [field]: value }))}
          onCancel={() => {
            setEditingCustomerId(null);
            setCustomerForm(initialCustomerForm);
            setMasterView('customers');
          }}
          onSubmit={handleCustomerSubmit}
          isSubmitting={submitting}
          mode={editingCustomerId ? 'edit' : 'create'}
        />
      );
    }

    if (masterView === 'add-item') {
      return (
        <ItemForm
          value={itemForm}
          onChange={(field, value) => setItemForm((current) => ({ ...current, [field]: value }))}
          onCancel={() => {
            setEditingItemId(null);
            setItemForm(initialItemForm);
            setMasterView('items');
          }}
          onSubmit={handleItemSubmit}
          isSubmitting={submitting}
          mode={editingItemId ? 'edit' : 'create'}
        />
      );
    }

    return <MasterHome onNavigate={setMasterView} customers={customers} items={items} />;
  }

  function renderBillingContent() {
    if (billingStage === 'editor' && selectedCustomer) {
      return (
        <BillingEditor
          customer={selectedCustomer}
          invoiceItems={draftItems}
          onAddItems={() => setIsItemModalOpen(true)}
          onUpdateQuantity={updateDraftQuantity}
          onCancel={resetBilling}
          onCreate={handleCreateInvoice}
          isSubmitting={submitting}
        />
      );
    }

    if (billingStage === 'created' && selectedInvoice) {
      return <InvoiceDetails invoice={selectedInvoice} title="Billing" onBack={resetBilling} />;
    }

    return <BillingLanding onStart={openBillingStart} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onChange={(view) => {
          setActiveView(view);
          setSelectedInvoice(null);
          if (view === 'master') {
            setMasterView('home');
          }
          if (view === 'billing') {
            setBillingStage('landing');
          }
        }}
      />

      <main className="content">
        <header className="page-header">
          <div>
            <h1>{activeView === 'master' ? 'Master' : activeView === 'billing' ? 'Billing' : 'Dashboard'}</h1>
            <p>Manage customers, items, billing workflows, and invoice records from one central workspace.</p>
          </div>
          {message ? <div className="toast toast--success">{message}</div> : null}
        </header>

        {error ? <div className="toast toast--error">{error}</div> : null}

        {loading ? (
          <div className="loading-card">Loading data...</div>
        ) : (
          <>
            {activeView === 'master' && renderMasterContent()}
            {activeView === 'billing' && renderBillingContent()}
            {activeView === 'dashboard' &&
              (selectedInvoice ? (
                <InvoiceDetails
                  invoice={selectedInvoice}
                  onBack={() => setSelectedInvoice(null)}
                />
              ) : (
                <Dashboard
                  invoices={invoices}
                  searchValue={dashboardSearch}
                  onSearchChange={setDashboardSearch}
                  onView={handleViewInvoice}
                />
              ))}
          </>
        )}
      </main>

      {isCustomerModalOpen ? (
        <Modal title="Select Customer" onClose={() => setIsCustomerModalOpen(false)}>
          <div className="card-grid">
            {customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                className={classNames(
                  'entity-card',
                  'entity-card--button',
                  customer.status === 'inactive' && 'entity-card--disabled',
                )}
                onClick={() => customer.status === 'active' && chooseCustomer(customer)}
              >
                <div>
                  <h4>{customer.name}</h4>
                  <p>{customer.address}</p>
                </div>
                <StatusBadge status={customer.status} />
              </button>
            ))}
          </div>
        </Modal>
      ) : null}

      {isItemModalOpen ? (
        <Modal
          title="Select Items"
          onClose={() => setIsItemModalOpen(false)}
          footer={
            <>
              <button type="button" className="ghost-button" onClick={() => setIsItemModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={() => setIsItemModalOpen(false)}>
                Add
              </button>
            </>
          }
        >
          <div className="card-grid">
            {items.map((item) => {
              const quantity = itemSelectionDraft.get(item.id) || 0;
              const isActive = item.status === 'active';

              return (
                <article
                  key={item.id}
                  className={classNames('entity-card', !isActive && 'entity-card--disabled')}
                >
                  <div>
                    <h4>{item.name}</h4>
                    <p>{currency(item.unitPrice)}</p>
                  </div>
                  {isActive ? (
                    quantity > 0 ? (
                      <div className="stepper">
                        <button type="button" onClick={() => updateDraftQuantity(item.id, quantity - 1)}>
                          -
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setDraftItems((current) => {
                              const existing = current.find((entry) => entry.itemId === item.id);
                              if (existing) {
                                return current.map((entry) =>
                                  entry.itemId === item.id
                                    ? { ...entry, quantity: entry.quantity + 1 }
                                    : entry,
                                );
                              }

                              return [
                                ...current,
                                {
                                  itemId: item.id,
                                  name: item.name,
                                  unitPrice: item.unitPrice,
                                  quantity: 1,
                                },
                              ];
                            })
                          }
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          setDraftItems((current) => [
                            ...current,
                            {
                              itemId: item.id,
                              name: item.name,
                              unitPrice: item.unitPrice,
                              quantity: 1,
                            },
                          ])
                        }
                      >
                        Add
                      </button>
                    )
                  ) : (
                    <StatusBadge status={item.status} />
                  )}
                </article>
              );
            })}
          </div>
        </Modal>
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title={pendingDelete.title}
          message={pendingDelete.message}
          confirmLabel={pendingDelete.confirmLabel}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}

export default App;
