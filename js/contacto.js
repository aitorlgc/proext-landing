/**
 * PROEXT - Contacto JavaScript
 * Validación de formulario y envío seguro
 */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contact-form');

  if (!form) return;

  const inputs = form.querySelectorAll('input, select, textarea');

  const validators = {
    nombre: (value) => {
      if (!value.trim()) return 'El nombre es obligatorio';
      if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
      if (value.trim().length > 100) return 'El nombre es demasiado largo';
      return null;
    },
    email: (value) => {
      if (!value.trim()) return 'El email es obligatorio';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Introduce un email válido';
      return null;
    },
    telefono: (value) => {
      if (!value.trim()) return 'El teléfono es obligatorio';
      const phoneRegex = /^[+]?[\d\s()-]{9,20}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Introduce un teléfono válido (9-20 dígitos)';
      return null;
    },
    codigo_postal: (value) => {
      if (!value.trim()) return 'El código postal es obligatorio';
      const postalRegex = /^\d{5}$/;
      if (!postalRegex.test(value)) return 'Introduce un código postal válido (5 dígitos)';
      return null;
    },
    interes: (value) => {
      if (!value) return 'Selecciona un tipo de interés';
      return null;
    },
    mensaje: (value) => {
      if (!value.trim()) return 'El mensaje es obligatorio';
      if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
      if (value.trim().length > 1000) return 'El mensaje es demasiado largo (máx. 1000 caracteres)';
      return null;
    }
  };

  const showError = (input, message) => {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    const existingError = formGroup.querySelector('.error-message');
    if (existingError) existingError.remove();

    input.classList.add('input-error');

    if (message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      errorDiv.style.color = '#dc2626';
      errorDiv.style.fontSize = '0.875rem';
      errorDiv.style.marginTop = '0.25rem';
      formGroup.appendChild(errorDiv);
    }
  };

  const clearError = (input) => {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    input.classList.remove('input-error');
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) existingError.remove();
  };

  const validateField = (input) => {
    const name = input.name;
    const validator = validators[name];
    if (!validator) return true;

    const error = validator(input.value);
    if (error) {
      showError(input, error);
    } else {
      clearError(input);
    }
    return !error;
  };

  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('input-error')) {
        validateField(input);
      }
    });
  });

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    clearAllErrors();

    let isValid = true;
    inputs.forEach(input => {
      const isFieldValid = validateField(input);
      if (!isFieldValid) isValid = false;
    });

    if (!isValid) {
      const firstError = form.querySelector('.input-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    const formData = {
      name: form.nombre.value.trim(),
      email: form.email.value.trim(),
      phone: form.telefono.value.trim(),
      codigo_postal: form.codigo_postal.value.trim(),
      interest: form.interes.value,
      message: form.mensaje.value.trim()
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showSuccessMessage();
        form.reset();
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach(error => {
            showFormError(error);
          });
        } else {
          alert('Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showFormError('Hubo un error de conexión. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  });

  function clearAllErrors() {
    inputs.forEach(input => clearError(input));
    const existingFormError = document.querySelector('.form-error-message');
    if (existingFormError) existingFormError.remove();
  }

  function showFormError(message) {
    const existingError = document.querySelector('.form-error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.innerHTML = `
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <svg style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style="color: #dc2626;">${message}</span>
      </div>
    `;
    form.insertBefore(errorDiv, form.firstChild);
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showSuccessMessage() {
    const existingMsg = document.querySelector('.success-message');
    if (existingMsg) existingMsg.remove();

    const existingError = document.querySelector('.form-error-message');
    if (existingError) existingError.remove();

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
      <div style="background: #dcfce7; border: 1px solid #86efac; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center;">
        <svg style="width: 56px; height: 56px; margin: 0 auto 1rem; display: block;" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h3 style="color: #16a34a; margin-bottom: 0.5rem; font-size: 1.25rem;">¡Mensaje enviado correctamente!</h3>
        <p style="color: #15803d; font-size: 1rem;">Gracias por contactarnos. Te responderemos en breve.</p>
      </div>
    `;

    form.insertBefore(successDiv, form.firstChild);
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      successDiv.style.transition = 'opacity 0.5s ease';
      successDiv.style.opacity = '0';
      setTimeout(() => successDiv.remove(), 500);
    }, 6000);
  }

  console.log('✅ ProExt - Contacto scripts loaded con seguridad');
});