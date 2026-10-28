# Onboarding Form

Step 1 of an onboarding flow: a form for personal and business details. Built for the Venn front-end take-home.

## Running it

```bash
npm install
npm run dev
npm test
npm run lint
npm run format
npm run build
npm run storybook
```

The API URL comes from `VITE_API_BASE_URL` in `.env`. Override it in `.env.local`.

## Stack

- React 19, TypeScript, Vite
- React Hook Form and Zod for the form and validation
- TanStack Query for the corporation number lookup and the submit
- libphonenumber-js to accept only Canadian phone numbers
- Tailwind CSS and lucide-react icons
- Vitest, React Testing Library and MSW
- Storybook
