/* PROEXT — Contacto
 * Validación y submit del formulario con campos editorial underline.
 */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select, textarea');
  const status = form.querySelector('.form-status');

  const validators = {
    nombre: (v) => (!v.trim() ? 'Obligatorio' : v.trim().length < 2 ? 'Demasiado corto' : v.trim().length > 100 ? 'Demasiado largo' : null),
    email: (v) => (!v.trim() ? 'Obligatorio' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Email no válido' : null),
    telefono: (v) => (!v.trim() ? 'Obligatorio' : !/^[+]?[\d\s()-]{9,20}$/.test(v.replace(/\s/g, '')) ? 'Teléfono no válido' : null),
    codigo_postal: (v) => (!v.trim() ? 'Obligatorio' : !/^\d{5}$/.test(v) ? '5 dígitos' : null),
    interes: (v) => (!v ? 'Selecciona una opción' : null),
    mensaje: (v) => (!v.trim() ? 'Obligatorio' : v.trim().length < 10 ? 'Mínimo 10 caracteres' : v.trim().length > 1000 ? 'Máximo 1000 caracteres' : null),
  };

  function fieldOf(input) { return input.closest('.field'); }
  function showError(input, msg) {
    const f = fieldOf(input);
    if (!f) return;
    f.classList.add('has-error');
    let err = f.querySelector('.field__error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field__error';
      f.appendChild(err);
    }
    err.textContent = msg;
  }
  function clearError(input) {
    const f = fieldOf(input);
    if (!f) return;
    f.classList.remove('has-error');
    const err = f.querySelector('.field__error');
    if (err) err.textContent = '';
  }
  function validateField(input) {
    const v = validators[input.name];
    if (!v) return true;
    const err = v(input.value);
    if (err) { showError(input, err); return false; }
    clearError(input);
    return true;
  }
  function setFilledClass(input) {
    const f = fieldOf(input);
    if (!f) return;
    f.classList.toggle('is-filled', !!input.value);
  }

  inputs.forEach((input) => {
    setFilledClass(input);
    input.addEventListener('blur', () => { validateField(input); setFilledClass(input); });
    input.addEventListener('input', () => { setFilledClass(input); if (fieldOf(input)?.classList.contains('has-error')) validateField(input); });
    input.addEventListener('change', () => setFilledClass(input));
  });

  function setStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove('is-success', 'is-error');
    if (type) status.classList.add('is-' + type);
    status.style.display = msg ? 'block' : 'none';
    if (msg) status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    let valid = true;
    inputs.forEach((i) => { if (!validateField(i)) valid = false; });
    if (!valid) {
      const first = form.querySelector('.has-error input, .has-error textarea, .has-error select');
      if (first) first.focus();
      return;
    }

    const payload = {
      name: form.nombre.value.trim(),
      email: form.email.value.trim(),
      phone: form.telefono.value.trim(),
      codigo_postal: form.codigo_postal.value.trim(),
      interest: form.interes.value,
      message: form.mensaje.value.trim(),
    };

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'ENVIANDO… <span class="arrow">↻</span>';

    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (data.success) {
        setStatus('Mensaje enviado · Te contactaremos en menos de 48h.', 'success');
        form.reset();
        inputs.forEach(setFilledClass);
      } else {
        setStatus((data.errors && data.errors.join(' · ')) || 'No se pudo enviar el formulario.', 'error');
      }
    } catch (err) {
      setStatus('Error de conexión. Inténtalo de nuevo.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });
});
