const PERSONAL_MATCH_RATE = 0.5;
const GIFT_AID_RATE = 0.25;
const EMPLOYER_MATCH_PER_BAKER = 200;

function toNonNegativeNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function toNonNegativeInt(value) {
  return Math.floor(toNonNegativeNumber(value));
}

function isProvided(value) {
  return value !== undefined && value !== null && value !== '';
}

export function computeTotals(input) {
  const donationsFromOthers = toNonNegativeNumber(input.donationsFromOthers);
  const giftAidFromOthers = toNonNegativeNumber(input.giftAidFromOthers);
  const numBakers = toNonNegativeInt(input.numBakers);

  const personalMatch = isProvided(input.personalMatchOverride)
    ? toNonNegativeNumber(input.personalMatchOverride)
    : PERSONAL_MATCH_RATE * donationsFromOthers;

  const userGiftAid = GIFT_AID_RATE * personalMatch;
  const employerCap = EMPLOYER_MATCH_PER_BAKER * numBakers;
  const qualifyingForEmployerMatch = donationsFromOthers + personalMatch;
  const employerMatch = Math.min(qualifyingForEmployerMatch, employerCap);
  const topUpToCap = Math.max(0, employerCap - qualifyingForEmployerMatch);

  const grandTotal =
    donationsFromOthers +
    giftAidFromOthers +
    personalMatch +
    userGiftAid +
    employerMatch;

  return {
    donationsFromOthers,
    giftAidFromOthers,
    personalMatch,
    userGiftAid,
    employerCap,
    qualifyingForEmployerMatch,
    employerMatch,
    topUpToCap,
    grandTotal,
  };
}

export function suggestPersonalMatch(donationsFromOthers, employerCap) {
  const donations = toNonNegativeNumber(donationsFromOthers);
  const cap = toNonNegativeNumber(employerCap);
  const halfDonations = PERSONAL_MATCH_RATE * donations;
  const fillToCap = cap - donations;
  return Math.max(0, halfDonations, fillToCap);
}
