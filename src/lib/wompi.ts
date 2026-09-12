// Tokenización de tarjeta: va DIRECTO a Wompi con la llave pública, nunca pasa
// por nuestro backend — es el mismo contrato que asume paymentService.js del
// lado del servidor (solo reenvía paymentMethod, nunca ve datos crudos de tarjeta).
const WOMPI_BASE_URL = process.env.EXPO_PUBLIC_WOMPI_BASE_URL || 'https://sandbox.wompi.co/v1';
const WOMPI_PUBLIC_KEY = process.env.EXPO_PUBLIC_WOMPI_PUBLIC_KEY || '';

export type CardInput = {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
};

export async function tokenizeCard(card: CardInput): Promise<string> {
  const res = await fetch(`${WOMPI_BASE_URL}/tokens/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
    },
    body: JSON.stringify({
      number: card.number.replace(/\s/g, ''),
      exp_month: card.expMonth,
      exp_year: card.expYear,
      cvc: card.cvc,
      card_holder: card.cardHolder,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.data?.id) {
    const message = data?.error?.messages
      ? Object.values(data.error.messages).flat().join(' ')
      : 'No se pudo validar la tarjeta. Revisa los datos e intenta de nuevo.';
    throw new Error(message);
  }
  return data.data.id as string;
}
