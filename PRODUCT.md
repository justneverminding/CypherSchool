# CypherSchool — Product Foundation

## Product promise

CypherSchool is a Stealf-powered privacy lab: a short, interactive learning experience that helps people understand financial privacy by doing, not just reading.

> Learn how financial privacy works. Experience it. Prove it. Keep what matters private.

## The outcome

A first-time visitor should be able to spend five minutes in CypherSchool and leave able to explain:

1. Public financial activity can expose patterns, relationships, and habits.
2. Privacy is control over personal information, not an admission of wrongdoing.
3. Cryptographic tools can enable useful verification or computation without exposing all underlying information.
4. Stealf belongs in a future where financial privacy is a product principle.

## Audience

- Curious newcomers to crypto, privacy, and financial technology.
- Bounty judges or ecosystem contributors who need to understand the project quickly.
- People who know that privacy matters but have not experienced why it matters.

CypherSchool assumes no prior technical knowledge. It should explain each idea plainly before introducing its technical name.

## The learning arc

```text
Observe exposure  →  Understand the privacy problem  →  Try a privacy primitive  →  Meet Stealf
```

The MVP contains three short interactive chapters:

1. **Financial Exposure** — fictional public transactions reveal how timing, amounts, and repeated activity can create a personal picture.
2. **Prove Without Revealing** — a simple zero-knowledge-inspired exercise illustrates proving a property without handing over the secret itself.
3. **Private Computation** — a focused MPC/Arcium lab demonstrates a private eligibility or classification check.

The final screen connects those experiences to Stealf.

## MVP boundaries

The first version includes:

- Alias-only entry with no email, wallet, profile photo, or KYC.
- Local, device-bound progress during early development.
- Three interactive chapters, XP, a small set of ranks, and a completion card.
- A direct, sourced Stealf conclusion.

The first version does not include:

- A global leaderboard.
- Persistent accounts, recovery keys, or cross-device sync.
- Real-money rewards, wagers, or financial advice.
- A full multi-course academy or social network.

## Visual direction

CypherSchool should feel like a calm, dark, editorial cryptography lab—not a generic dashboard or a literal Duolingo clone.

- Near-black surfaces, restrained electric green or teal signal color, and warm off-white text.
- Large readable type, deliberate spacing, and short, confident copy.
- Visual metaphors: signals, encrypted layers, receipts, paths, proofs, and concealed/revealed states.
- Motion should explain state changes, never exist as decoration alone.
- Mobile is first-class: scroll-safe, tap-friendly, and free of overflowing panels or busy telemetry.

## Trust and language rules

The product must distinguish demonstrations from deployed privacy technology.

- Say **simulation** when an interaction is client-side or illustrative.
- Say **Arcium-powered private computation** only when the relevant computation genuinely executes through Arcium.
- Do not call a receipt, XP record, or completion state a zero-knowledge proof unless it actually is one.
- Stealf's public materials describe a dual-wallet architecture: a public, KYC wallet with visible balances and transparent transactions, and a separate private wallet where Arcium MPC encrypts balances, amounts, senders, and receivers. The two wallets are described as unlinked.
- Do not extend those claims beyond the supplied Stealf sources. In particular, do not label CypherSchool's local XP or completion state as private on-chain data.
- Use fictional transaction data only. Never request real wallets, balances, transaction histories, or other sensitive financial data.

## Success criteria

CypherSchool succeeds when a visitor can complete the experience in five minutes, understand the core privacy idea without a lecture, and identify the private-computation lab as the project’s technical centerpiece.

## Stealf source of truth

CypherSchool's final Stealf lesson should cite and link to these sources:

- [Stealf on X](https://x.com/stealfxyz)
- [Stealf: Stable Coin Based Neo Bank with Arcium](https://medium.com/@stealf.fi/stealf-stable-coin-based-neo-bank-with-arcium-52fc14b814cb)
- [Stealf website](https://www.stealf.xyz)

### Approved lesson facts

- Stealf describes itself as a stablecoin-native neobank on Solana.
- It presents a public wallet and a private wallet as separate choices for users.
- The public wallet is KYC-verified, with visible balances and transparent transactions.
- The private wallet is described as using Arcium's MPC network to encrypt balances, amounts, senders, and receivers, without a KYC requirement.
- Stealf states that Grid infrastructure, built by Squads Protocol, supports resilience and security; it also describes multisig support for specific high-value operations.
- Examples presented by Stealf include private salary payments, private savings, and private P2P payments.

Any statement about the live product's availability, compliance posture, performance, or absolute anonymity must be rechecked against the official source at the time CypherSchool is published.
