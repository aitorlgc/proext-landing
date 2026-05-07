/**
 * PROEXT - Contacto JavaScript
 * Validación de formulario y envío
 */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contact-form');

  if (!form) return;

  // ==========================================
  // VALIDACIÓN EN TIEMPO REAL
  // ==========================================
  const inputs = form.querySelectorAll('input, select, textarea');

  const validators = {
    nombre: (value) => {
      if (!value.trim()) return 'El nombre es obligatorio';
      if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
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
      const phoneRegex = /^[+]?[\d\s()-]{9,}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Introduce un teléfono válido';
      return null;
    },
    interes: (value) => {
      if (!value) return 'Selecciona un tipo de interés';
      return null;
    },
    mensaje: (value) => {
      if (!value.trim()) return 'El mensaje es obligatorio';
      if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
      return null;
    }
  };

  // Función para mostrar error
  const showError = (input, message) => {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    // Remove existing error
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) existingError.remove();

    // Add error class
    input.classList.add('input-error');

    // Add error message
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

  // Función para limpiar error
  const clearError = (input) => {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    input.classList.remove('input-error');
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) existingError.remove();
  };

  // Validar campo individual
  const validateField = (input) => {
    const name = input.name;
    const validator = validators[name];
    if (!validator) return true;

    const error = validator(input.value);
    showError(input, error);
    return !error;
  };

  // Add blur validation
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('input-error')) {
        validateField(input);
      }
    });
  });

  // ==========================================
  // ENVÍO DEL FORMULARIO
  // ==========================================
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    inputs.forEach(input => {
      const isFieldValid = validateField(input);
      if (!isFieldValid) isValid = false;
    });

    if (!isValid) {
      // Scroll to first error
      const firstError = form.querySelector('.input-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Get form data
    const formData = {
      name: form.nombre.value.trim(),
      email: form.email.value.trim(),
      phone: form.telefono.value.trim(),
      interest: form.interes.value,
      message: form.mensaje.value.trim()
    };

    // Show loading state
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
        // Show success message
        showSuccessMessage();
        form.reset();
      } else {
        alert('Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error de conexión. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      // Restore button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  });

  // ==========================================
  // MENSAJE DE ÉXITO
  // ==========================================
  function showSuccessMessage() {
    // Remove existing message
    const existingMsg = document.querySelector('.success-message');
    if (existingMsg) existingMsg.remove();

    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
      <div style="background: #dcfce7; border: 1px solid #86efac; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;">
        <svg style="width: 48px; height: 48px; margin: 0 auto 0.5rem; display: block;" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h3 style="color: #16a34a; margin-bottom: 0.5rem;">¡Mensaje enviado correctamente!</h3>
        <p style="color: #15803d; font-size: 0.9375rem;">Gracias por contactarnos. Te responderemos en breve.</p>
      </div>
    `;

    form.insertBefore(successDiv, form.firstChild);

    // Scroll to message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      successDiv.style.transition = 'opacity 0.5s ease';
      successDiv.style.opacity = '0';
      setTimeout(() => successDiv.remove(), 500);
    }, 5000);
  }

  console.log('✅ ProExt - Contacto scripts loaded');
});