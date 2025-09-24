// Validation service for form inputs
class ValidationService {
    constructor() {
        this.rules = CONFIG.VALIDATION;
        this.messages = CONFIG.MESSAGES.VALIDATION;
    }

    // Validate a single field
    validateField(name, value, existingUsers = []) {
        const errors = [];

        switch (name) {
            case 'firstName':
            case 'lastName':
                errors.push(...this.validateName(value));
                break;
            case 'username':
                errors.push(...this.validateUsername(value, existingUsers));
                break;
            case 'email':
                errors.push(...this.validateEmail(value, existingUsers));
                break;
            case 'phone':
                if (value.trim()) { // Phone is optional
                    errors.push(...this.validatePhone(value));
                }
                break;
            case 'website':
                if (value.trim()) { // Website is optional
                    errors.push(...this.validateWebsite(value));
                }
                break;
            case 'department':
                if (value.trim()) { // Department is optional
                    errors.push(...this.validateDepartment(value));
                }
                break;
        }

        return errors;
    }

    // Validate name fields (firstName, lastName)
    validateName(value) {
        const errors = [];
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            errors.push(this.messages.REQUIRED_FIELD);
            return errors;
        }

        if (trimmedValue.length < this.rules.MIN_NAME_LENGTH) {
            errors.push(CONFIG.formatMessage('MESSAGES.VALIDATION.MIN_LENGTH', { 
                min: this.rules.MIN_NAME_LENGTH 
            }));
        }

        if (trimmedValue.length > this.rules.MAX_NAME_LENGTH) {
            errors.push(CONFIG.formatMessage('MESSAGES.VALIDATION.MAX_LENGTH', { 
                max: this.rules.MAX_NAME_LENGTH 
            }));
        }

        return errors;
    }

    // Validate username
    validateUsername(value, existingUsers = []) {
        const errors = [];
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            errors.push(this.messages.REQUIRED_FIELD);
            return errors;
        }

        if (trimmedValue.length < this.rules.MIN_NAME_LENGTH) {
            errors.push(CONFIG.formatMessage('MESSAGES.VALIDATION.MIN_LENGTH', { 
                min: this.rules.MIN_NAME_LENGTH 
            }));
        }

        if (trimmedValue.length > this.rules.MAX_NAME_LENGTH) {
            errors.push(CONFIG.formatMessage('MESSAGES.VALIDATION.MAX_LENGTH', { 
                max: this.rules.MAX_NAME_LENGTH 
            }));
        }

        // Check for duplicate username
        const isDuplicate = existingUsers.some(user => 
            user.username.toLowerCase() === trimmedValue.toLowerCase()
        );

        if (isDuplicate) {
            errors.push(this.messages.DUPLICATE_USERNAME);
        }

        return errors;
    }

    // Validate email
    validateEmail(value, existingUsers = []) {
        const errors = [];
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            errors.push(this.messages.REQUIRED_FIELD);
            return errors;
        }

        if (!this.rules.EMAIL_PATTERN.test(trimmedValue)) {
            errors.push(this.messages.INVALID_EMAIL);
        }

        if (trimmedValue.length > this.rules.MAX_EMAIL_LENGTH) {
            errors.push(CONFIG.formatMessage('MESSAGES.VALIDATION.MAX_LENGTH', { 
                max: this.rules.MAX_EMAIL_LENGTH 
            }));
        }

        // Check for duplicate email
        const isDuplicate = existingUsers.some(user => 
            user.email.toLowerCase() === trimmedValue.toLowerCase()
        );

        if (isDuplicate) {
            errors.push(this.messages.DUPLICATE_EMAIL);
        }

        return errors;
    }

    // Validate phone
    validatePhone(value) {
        const errors = [];
        const trimmedValue = value.trim();

        if (trimmedValue && !this.rules.PHONE_PATTERN.test(trimmedValue)) {
            errors.push(this.messages.INVALID_PHONE);
        }

        if (trimmedValue.length > this.rules.MAX_PHONE_LENGTH) {
            errors.push(CONFIG.formatMessage('MESSAGES.VALIDATION.MAX_LENGTH', { 
                max: this.rules.MAX_PHONE_LENGTH 
            }));
        }

        return errors;
    }

    // Validate website URL
    validateWebsite(value) {
        const errors = [];
        const trimmedValue = value.trim();

        if (trimmedValue && !this.rules.URL_PATTERN.test(trimmedValue)) {
            errors.push(this.messages.INVALID_URL);
        }

        if (trimmedValue.length > this.rules.MAX_WEBSITE_LENGTH) {
            errors.push(CONFIG.formatMessage('MESSAGES.VALIDATION.MAX_LENGTH', { 
                max: this.rules.MAX_WEBSITE_LENGTH 
            }));
        }

        return errors;
    }

    // Validate department
    validateDepartment(value) {
        const errors = [];
        const trimmedValue = value.trim();

        if (trimmedValue.length > this.rules.MAX_DEPARTMENT_LENGTH) {
            errors.push(CONFIG.formatMessage('MESSAGES.VALIDATION.MAX_LENGTH', { 
                max: this.rules.MAX_DEPARTMENT_LENGTH 
            }));
        }

        return errors;
    }

    // Validate entire form
    validateForm(formData, existingUsers = [], excludeUserId = null) {
        const allErrors = {};
        let isValid = true;

        // Filter out the user being edited from duplicate checks
        const usersForDuplicateCheck = existingUsers.filter(user => 
            excludeUserId ? user.id !== excludeUserId : true
        );

        // Validate each field
        Object.keys(formData).forEach(fieldName => {
            const fieldErrors = this.validateField(
                fieldName, 
                formData[fieldName], 
                usersForDuplicateCheck
            );

            if (fieldErrors.length > 0) {
                allErrors[fieldName] = fieldErrors;
                isValid = false;
            }
        });

        return {
            isValid,
            errors: allErrors
        };
    }

    // Display validation errors in the UI
    displayErrors(errors) {
        // Clear previous errors
        this.clearErrors();

        Object.keys(errors).forEach(fieldName => {
            const errorElement = document.getElementById(`${fieldName}Error`);
            const inputElement = document.getElementById(fieldName);

            if (errorElement && inputElement) {
                errorElement.textContent = errors[fieldName][0]; // Show first error
                inputElement.classList.add('error');
            }
        });
    }

    // Clear all validation errors
    clearErrors() {
        const errorElements = document.querySelectorAll('.error-text');
        const inputElements = document.querySelectorAll('.error');

        errorElements.forEach(element => {
            element.textContent = '';
        });

        inputElements.forEach(element => {
            element.classList.remove('error');
        });
    }

    // Real-time validation for a single field
    validateFieldRealTime(fieldName, value, existingUsers = [], excludeUserId = null) {
        const usersForDuplicateCheck = existingUsers.filter(user => 
            excludeUserId ? user.id !== excludeUserId : true
        );

        const errors = this.validateField(fieldName, value, usersForDuplicateCheck);
        const errorElement = document.getElementById(`${fieldName}Error`);
        const inputElement = document.getElementById(fieldName);

        if (errorElement && inputElement) {
            if (errors.length > 0) {
                errorElement.textContent = errors[0];
                inputElement.classList.add('error');
            } else {
                errorElement.textContent = '';
                inputElement.classList.remove('error');
            }
        }

        return errors.length === 0;
    }

    // Setup real-time validation for form
    setupRealTimeValidation(formElement, existingUsers = [], excludeUserId = null) {
        const inputs = formElement.querySelectorAll('input[name]');

        inputs.forEach(input => {
            const fieldName = input.getAttribute('name');
            
            // Debounced validation
            let timeoutId;
            
            input.addEventListener('input', () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    this.validateFieldRealTime(
                        fieldName, 
                        input.value, 
                        existingUsers, 
                        excludeUserId
                    );
                }, CONFIG.UI.DEBOUNCE_DELAY);
            });

            // Immediate validation on blur
            input.addEventListener('blur', () => {
                this.validateFieldRealTime(
                    fieldName, 
                    input.value, 
                    existingUsers, 
                    excludeUserId
                );
            });
        });
    }
}

// Create a singleton instance
const validationService = new ValidationService();

// Make it globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationService;
} else {
    window.validationService = validationService;
}