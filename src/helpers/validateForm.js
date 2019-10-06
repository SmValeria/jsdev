export function validateForm(form, fieldNames) {
  let valid = true;
  for (const fieldName of fieldNames) {
    if (!validateField(form.elements[fieldName])) {
      valid = false
    }
  }

  return valid;
}

function validateField(field) {
    if (!field.checkValidity()) {
    showInputError(field, field.validationMessage);

    return false;
  }
  field.parentElement
      .nextElementSibling
      .textContent = '';

  return true;

}

export function showInputError(field, errorText) {
  field.parentElement
      .nextElementSibling
      .textContent = errorText;
  field.parentElement
      .nextElementSibling
      .classList.remove('hidden');
}