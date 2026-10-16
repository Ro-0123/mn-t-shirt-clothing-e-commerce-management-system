import Swal from 'sweetalert2';

// Modern SweetAlert2 Toast & Alert helpers with Elegant Dark styling
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const SuccessToast = (title, text = '') => {
  return Toast.fire({
    icon: 'success',
    title,
    text,
    background: '#1a1a1e',
    color: '#f4f4f5'
  });
};

export const ErrorToast = (title, text = '') => {
  return Toast.fire({
    icon: 'error',
    title,
    text,
    background: '#1a1a1e',
    color: '#f4f4f5'
  });
};

export const InfoToast = (title, text = '') => {
  return Toast.fire({
    icon: 'info',
    title,
    text,
    background: '#1a1a1e',
    color: '#f4f4f5'
  });
};

export const ConfirmDialog = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  confirmButtonText = 'Yes, proceed',
  cancelButtonText = 'Cancel',
  icon = 'warning',
  confirmButtonColor = '#4f46e5'
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    background: '#1a1a1e',
    color: '#f4f4f5',
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor: '#3f3f46',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-white/10',
      confirmButton: 'px-5 py-2.5 rounded-xl text-sm font-bold',
      cancelButton: 'px-5 py-2.5 rounded-xl text-sm font-bold'
    }
  });
  return result.isConfirmed;
};

// Same as ConfirmDialog, but collects a required text reason before confirming.
// Resolves to the trimmed reason string if confirmed, or null if cancelled/empty.
export const ConfirmWithReason = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  inputLabel = 'Reason',
  inputPlaceholder = 'Enter your reason...',
  confirmButtonText = 'Yes, proceed',
  cancelButtonText = 'Cancel',
  icon = 'warning',
  confirmButtonColor = '#4f46e5'
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    input: 'textarea',
    inputLabel,
    inputPlaceholder,
    background: '#1a1a1e',
    color: '#f4f4f5',
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor: '#3f3f46',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'Please provide a reason';
      }
    },
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-white/10',
      confirmButton: 'px-5 py-2.5 rounded-xl text-sm font-bold',
      cancelButton: 'px-5 py-2.5 rounded-xl text-sm font-bold'
    }
  });
  if (!result.isConfirmed) return null;
  return result.value.trim();
};

export const LoadingModal = (title = 'Processing...', html = 'Please wait while we process your request') => {
  Swal.fire({
    title,
    html,
    background: '#1a1a1e',
    color: '#f4f4f5',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const ConfirmDelete = async (itemName = 'this item') => {
  return ConfirmDialog({
    title: `Delete ${itemName}?`,
    text: `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`,
    confirmButtonText: 'Yes, Delete',
    confirmButtonColor: '#e11d48',
    icon: 'warning'
  });
};

export const CloseModal = () => {
  Swal.close();
};

export const SuccessModal = (title, text = '', confirmButtonText = 'Great!') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    background: '#1a1a1e',
    color: '#f4f4f5',
    confirmButtonColor: '#4f46e5',
    confirmButtonText,
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-white/10',
      confirmButton: 'px-6 py-2.5 rounded-xl font-bold'
    }
  });
};

