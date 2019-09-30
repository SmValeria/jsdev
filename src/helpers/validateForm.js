export default function validateForm(form) {
    let valid = true;

    if (!validateField(form.elements.name)) {
        valid = false
    }

    if (!validateField(form.elements.place)) {
        valid = false
    }

    if (!validateField(form.elements.comment)) {
        valid = false
    }

    return valid;
}

function validateField(field) {
    if (!field.checkValidity()) {
        field.nextElementSibling.textContent = field.validationMessage;
        
        return false;
    } 
    field.nextElementSibling.textContent = '';
    
    return true;
  
}