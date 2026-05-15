import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTotals, suggestPersonalMatch } from './math.mjs';

test('worked example yields £4,562.50 grand total', () => {
  const result = computeTotals({
    donationsFromOthers: 1700,
    giftAidFromOthers: 200,
    numBakers: 8,
    corporateGiftAidEligible: false,
  });
  assert.equal(result.personalMatch, 850);
  assert.equal(result.userGiftAid, 212.5);
  assert.equal(result.employerCap, 1600);
  assert.equal(result.qualifyingForEmployerMatch, 2550);
  assert.equal(result.employerMatch, 1600);
  assert.equal(result.employerGiftAid, 0);
  assert.equal(result.topUpToCap, 0);
  assert.equal(result.grandTotal, 4562.5);
});

test('personalMatchOverride is honored when provided', () => {
  const result = computeTotals({
    donationsFromOthers: 1000,
    giftAidFromOthers: 0,
    numBakers: 5,
    personalMatchOverride: 750,
    corporateGiftAidEligible: false,
  });
  assert.equal(result.personalMatch, 750);
});

test('personalMatchOverride defaults to 50% when blank string', () => {
  const result = computeTotals({
    donationsFromOthers: 1000,
    giftAidFromOthers: 0,
    numBakers: 5,
    personalMatchOverride: '',
    corporateGiftAidEligible: false,
  });
  assert.equal(result.personalMatch, 500);
});

test('personalMatchOverride defaults to 50% when undefined', () => {
  const result = computeTotals({
    donationsFromOthers: 1000,
    giftAidFromOthers: 0,
    numBakers: 5,
    corporateGiftAidEligible: false,
  });
  assert.equal(result.personalMatch, 500);
});

test('employerMatch is capped at 200 × numBakers', () => {
  const result = computeTotals({
    donationsFromOthers: 5000,
    giftAidFromOthers: 0,
    numBakers: 3,
    corporateGiftAidEligible: false,
  });
  assert.equal(result.employerCap, 600);
  assert.equal(result.employerMatch, 600);
});

test('topUpToCap shows shortfall when qualifying is below cap', () => {
  const result = computeTotals({
    donationsFromOthers: 800,
    giftAidFromOthers: 0,
    numBakers: 8,
    corporateGiftAidEligible: false,
  });
  // default personalMatch = 400; qualifying = 1200; cap = 1600; topUp = 400
  assert.equal(result.topUpToCap, 400);
});

test('topUpToCap is 0 when qualifying meets or exceeds cap', () => {
  const result = computeTotals({
    donationsFromOthers: 2000,
    giftAidFromOthers: 0,
    numBakers: 8,
    corporateGiftAidEligible: false,
  });
  assert.equal(result.topUpToCap, 0);
});

test('corporateGiftAidEligible adds 25% on top of employer match', () => {
  const result = computeTotals({
    donationsFromOthers: 1700,
    giftAidFromOthers: 200,
    numBakers: 8,
    corporateGiftAidEligible: true,
  });
  assert.equal(result.employerGiftAid, 400);
  assert.equal(result.grandTotal, 4962.5);
});

test('numBakers = 0 produces zero employer cap and match', () => {
  const result = computeTotals({
    donationsFromOthers: 1000,
    giftAidFromOthers: 100,
    numBakers: 0,
    corporateGiftAidEligible: false,
  });
  assert.equal(result.employerCap, 0);
  assert.equal(result.employerMatch, 0);
  assert.equal(result.topUpToCap, 0);
});

test('negative inputs are clamped to 0', () => {
  const result = computeTotals({
    donationsFromOthers: -500,
    giftAidFromOthers: -50,
    numBakers: -3,
    personalMatchOverride: -200,
    corporateGiftAidEligible: false,
  });
  assert.equal(result.personalMatch, 0);
  assert.equal(result.employerCap, 0);
  assert.equal(result.employerMatch, 0);
  assert.equal(result.grandTotal, 0);
});

test('empty / non-numeric inputs treated as 0', () => {
  const result = computeTotals({
    donationsFromOthers: '',
    giftAidFromOthers: 'banana',
    numBakers: '',
    corporateGiftAidEligible: false,
  });
  assert.equal(result.grandTotal, 0);
});

test('suggestPersonalMatch returns max of half-donations and fill-to-cap', () => {
  // half = 400; fill = 800 → 800
  assert.equal(suggestPersonalMatch(800, 1600), 800);
  // half = 850; fill = -100 → 850 (clamped to half)
  assert.equal(suggestPersonalMatch(1700, 1600), 850);
  // half = 0; fill = 1600 → 1600
  assert.equal(suggestPersonalMatch(0, 1600), 1600);
  // negative donations treated as 0
  assert.equal(suggestPersonalMatch(-500, 1600), 1600);
});
