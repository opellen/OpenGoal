# Contributing

Issues are welcome — bugs, questions, ideas, disagreements. A precise report of how
an agent misread a command is the most useful thing you can send.

Pull requests are accepted for platform adapters (`src/platforms/`). They are not
accepted for `templates/` or `docs/`: prompt correctness is behavioural, and a change
that reads better can make an agent behave worse in ways no test catches.

Translation corrections (`README.zh-CN.md`, `README.ja.md`) are the one prose area
where PRs are welcome — a native speaker can verify what the maintainer cannot.

## Adding or fixing an adapter

1. Add or edit the adapter in `src/platforms/`, and register it in `index.ts`.
2. Add its case to `tests/platforms.test.ts`.
3. `npm run build && npm test` — the `prefix propagation` suite fails any adapter
   that ignores the prefix it is handed.
4. Say which tool version you tested against, and what you saw.

## Development

```bash
git clone https://github.com/opellen/OpenGoal.git
cd OpenGoal
npm install
npm run build
npm test
```
