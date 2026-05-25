# MealDrop — Laboratory work 10

API Storage. LocalStorage and data attributes.

## Run

```cmd
npm install
npm run server
```

JSON Server runs on:

```text
http://localhost:3010
```

Open `saut.html` with Live Server.

## Implemented

- RU/EN translation using `data-i18n` and `dataset`.
- Active language button.
- Light/dark theme switch.
- Several images change visual state when theme changes.
- User settings are saved in `localStorage`.
- Logged-in user is saved in `localStorage`.
- Logout button appears after login/registration.
- User profile icon opens a modal with editable personal data.
- Reset settings button.
- Cart and favorites use the user from `localStorage`.
