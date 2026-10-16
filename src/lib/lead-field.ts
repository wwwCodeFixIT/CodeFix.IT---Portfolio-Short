export type LeadFieldElement = HTMLInputElement | HTMLTextAreaElement

export function leadFieldError(field: LeadFieldElement) {
  field.setCustomValidity('')
  if (!field.willValidate) return ''
  let error = ''
  if (field.required && !field.value.trim()) error = 'Uzupełnij to pole.'
  else if (field.value && field.minLength > 0 && field.value.trim().length < field.minLength)
    error = `Minimalna liczba znaków: ${field.minLength}.`
  else if (field.maxLength >= 0 && field.value.length > field.maxLength)
    error = `Maksymalna liczba znaków: ${field.maxLength}.`
  else if (field.validity.typeMismatch)
    error =
      field.type === 'email'
        ? 'Podaj poprawny e-mail, np. imie@firma.pl.'
        : 'Podaj pełny adres, np. https://twojastrona.pl.'
  else if (!field.validity.valid) error = field.validationMessage
  // Native required validation clears when an untouched empty field is restored/autofilled.
  if (field.value) field.setCustomValidity(error)
  return error
}
