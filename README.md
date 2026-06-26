# Canon Law Guardrails Prototype - Baptism

A small browser prototype for baptismal certificate guardrails. It separates Sponsor/Godparent, Christian Witness, and Witness roles, keeps draft preview available, and blocks final certificate generation when centralized canon-law validation finds blocking errors.

## Run locally

```bash
npm start
```

Open `http://localhost:4173`.

## Test

```bash
npm test
```

The tests cover invalid sponsor, Christian Witness, Witness, generic role, qualification, and adoption-context scenarios.
