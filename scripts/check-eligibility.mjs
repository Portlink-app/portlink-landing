/**
 * check:eligibility — the work-email rule must refuse consumer mailboxes without refusing companies.
 *
 * WHY A GATE AND NOT A COMMENT. One function, `isFreeMail`, decides who may enter the Seatrade draw
 * and who may ask for a pilot. Both funnels reach it through `workEmailProblem`, so an edit here
 * moves two forms at once, and it can fail in two opposite and unequal ways. Letting a Gmail address
 * through puts one consumer lead on a list a person reads. Refusing a real prospect shows them a
 * sentence telling them to use their work email — which is what they just did — and tells nobody
 * else. The second failure is silent, and silence is why it survived until someone read the code.
 *
 * THE CHECK IS AN INVARIANT, NOT A ROW LIST. A row list only catches the case its author thought of;
 * the bug this replaces was invisible to every row anyone had written. So the corpus is generated
 * from the real provider sets and the real suffix table, and three properties are asserted over all
 * of it: every provider is still refused as its own domain under every suffix form, every company
 * running mail on a subdomain of its own name is accepted, and the new rule never refuses an address
 * the old one accepted. Add a provider tomorrow and it is covered without editing anything here.
 *
 * Paired ALLOW, because a gate with only DENY cases passes on a rule that refuses everyone.
 */
import assert from 'node:assert/strict'
import {
  DISPOSABLE_DOMAINS,
  FREE_MAIL_LABELS,
  TWO_LABEL_SUFFIXES,
  isFreeMail,
  workEmailProblem,
} from '../lib/seatrade/eligibility.ts'
import { pilotEmailProblem } from '../lib/access/eligibility.ts'

let failures = 0
const check = (name, fn) => {
  try {
    fn()
  } catch (error) {
    failures += 1
    console.error(`  FAIL  ${name}\n        ${error.message.split('\n')[0]}`)
  }
}

/** The rule as it stood before the suffix table, kept here as the calibration baseline. */
const firstLabelRule = (domain) =>
  FREE_MAIL_LABELS.has(domain.split('.')[0]) || DISPOSABLE_DOMAINS.has(domain)

// ---------------------------------------------------------------------------------------------
// 1. The named cases, in both directions. These are the rows the finding was argued on.
// ---------------------------------------------------------------------------------------------
const REFUSE = [
  'gmail.com', 'googlemail.com', 'web.de', 'mail.ru', 'outlook.es', 'yahoo.fr', 'online.no',
  'hotmail.co.uk', 'yahoo.com.au', 'hotmail.com.br', 'yahoo.co.jp', 'mailinator.com',
]
const ACCEPT = [
  'mail.portagent.no', 'email.msccruises.com', 'home.tallink.ee', 'web.hurtigruten.no',
  'online.dfds.com', 'mail.acme.co.uk', 'portagent.no', 'msccruises.com',
]
for (const domain of REFUSE) {
  check(`refuses ${domain}`, () => assert.equal(isFreeMail(domain), true))
}
for (const domain of ACCEPT) {
  check(`accepts ${domain}`, () => assert.equal(isFreeMail(domain), false))
}

// ---------------------------------------------------------------------------------------------
// 2. Every provider is still refused as its own domain, under every suffix form we know.
//    This is the half that must not loosen, and it is generated, not listed.
// ---------------------------------------------------------------------------------------------
check('every free-mail label is refused as a whole registrable domain', () => {
  for (const label of FREE_MAIL_LABELS) {
    for (const tld of ['com', 'net', 'no', 'de', 'fr', 'es', 'ru', ...TWO_LABEL_SUFFIXES]) {
      assert.equal(isFreeMail(`${label}.${tld}`), true, `${label}.${tld} should be refused`)
    }
  }
})

check('every disposable domain is still refused', () => {
  for (const domain of DISPOSABLE_DOMAINS) {
    assert.equal(isFreeMail(domain), true, `${domain} should be refused`)
  }
})

// ---------------------------------------------------------------------------------------------
// 3. Every provider label is accepted as a mail host under a company's own domain.
//    This is the class that was broken, and it is the whole reason for the change.
// ---------------------------------------------------------------------------------------------
check('a free-mail label under a company domain is accepted as a mail host', () => {
  for (const label of FREE_MAIL_LABELS) {
    for (const company of ['portagent.no', 'msccruises.com', 'acme.co.uk', 'shipping.com.au']) {
      assert.equal(isFreeMail(`${label}.${company}`), false, `${label}.${company} should be accepted`)
    }
  }
})

// ---------------------------------------------------------------------------------------------
// 4. The change is a widening, by measurement rather than by inspection: nothing the old rule
//    accepted is refused now. This is the property the funnel-freeze was lifted on.
// ---------------------------------------------------------------------------------------------
check('no address the first-label rule accepted is refused now', () => {
  const corpus = []
  for (const label of FREE_MAIL_LABELS) {
    for (const tld of ['com', 'no', 'de', 'co.uk', 'com.au', 'co.zz']) {
      corpus.push(`${label}.${tld}`, `${label}.acme.${tld}`, `mail.${label}.${tld}`)
    }
  }
  corpus.push(...DISPOSABLE_DOMAINS, ...ACCEPT, ...REFUSE, 'acme.com', 'a.b.c.d.e.no', 'no', '')
  for (const domain of corpus) {
    if (isFreeMail(domain)) {
      assert.equal(firstLabelRule(domain), true, `${domain} is newly refused — that is a narrowing`)
    }
  }
})

// ---------------------------------------------------------------------------------------------
// 5. The suffix table fails OPEN, which is the reason it may be a hand table at all. A suffix we
//    have not listed must accept, never refuse — one stray lead, not one lost customer.
// ---------------------------------------------------------------------------------------------
check('an unlisted two-label suffix accepts rather than refuses', () => {
  assert.equal(TWO_LABEL_SUFFIXES.has('co.zz'), false)
  assert.equal(isFreeMail('hotmail.co.zz'), false)
})

// ---------------------------------------------------------------------------------------------
// 6. Proved where the funnels actually call it: both forms, through their own copy.
// ---------------------------------------------------------------------------------------------
check('the draw form accepts a company mail host and still refuses a consumer mailbox', () => {
  assert.equal(workEmailProblem('ada@email.msccruises.com'), null)
  assert.equal(workEmailProblem('ada@mail.portagent.no'), null)
  assert.notEqual(workEmailProblem('ada@hotmail.co.uk'), null)
  assert.notEqual(workEmailProblem('ada@gmail.com'), null)
  assert.notEqual(workEmailProblem('not-an-address'), null)
  assert.match(workEmailProblem('ada@mailinator.com'), /Temporary addresses/)
})

check('the pilot form accepts a company mail host and still refuses a consumer mailbox', () => {
  assert.equal(pilotEmailProblem('ada@email.msccruises.com'), null)
  assert.equal(pilotEmailProblem('ada@mail.portagent.no'), null)
  assert.notEqual(pilotEmailProblem('ada@hotmail.co.uk'), null)
  assert.notEqual(pilotEmailProblem('ada@gmail.com'), null)
  assert.match(pilotEmailProblem('half-an-address@'), /valid email address/)
})

// ---------------------------------------------------------------------------------------------
// 7. The table may only hold genuine multi-label public suffixes: a wrong entry refuses a company.
//    And none may lead with a provider label, or `mail.<suffix>` collapses to the provider alone.
// ---------------------------------------------------------------------------------------------
check('every suffix is two labels and ends in a plausible ccTLD or gTLD', () => {
  for (const suffix of TWO_LABEL_SUFFIXES) {
    const parts = suffix.split('.')
    assert.equal(parts.length, 2, `${suffix} must be exactly two labels`)
    assert.match(parts[1], /^[a-z]{2,3}$/, `${suffix} must end in a TLD`)
    assert.equal(FREE_MAIL_LABELS.has(parts[0]), false, `${suffix} shadows a provider label`)
  }
})

if (failures > 0) {
  console.error(`\ncheck:eligibility FAILED — ${failures} case(s).`)
  process.exit(1)
}
console.log('check:eligibility clean. Providers still refused, company mail hosts accepted, no narrowing.')
