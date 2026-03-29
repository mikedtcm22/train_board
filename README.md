# train_board

Digital household calendar display styled like a split-flap train station board.

## Documents

- [Product Requirements Document](./docs/product-requirements.md)
- [Technical Implementation Plan](./docs/technical-implementation-plan.md)

## Status

Phase 1 is now underway. The repository includes a static Next.js prototype with:

- a full-screen `/display` route
- a split-flap board UI with animated character changes
- rotating mock family calendar states to exercise the animation system
- a placeholder `/admin` route reserved for future settings work

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/display`.
