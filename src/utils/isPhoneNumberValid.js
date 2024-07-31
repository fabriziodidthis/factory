/**
 * @description Função que valida um número de telefone
 * @param {*} phone Recebe um número de telefone para validar
 * @returns Se o número de telefone é válido ou não
 */
const validatePhoneNumber = (phone) => {
  // Removendo todos os não dígitos do telefone
  const cleanedPhone = phone.replace(/[^\d]/g, '')

  // Validando e limpando o número de telefone
  const isValid = /^\d{10,11}$/.test(cleanedPhone)

  return isValid
    ? `O número ${cleanedPhone} é um número válido.`
    : Error(`O número ${cleanedPhone} não é um número válido.`)
}

module.exports = { validatePhoneNumber }
