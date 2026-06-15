# FlyDreamAir Loyalty Program

## Project Overview

FlyDreamAir Loyalty Program is a web application designed to support airline customers, staff, managers, and administrators through account management, booking workflows, loyalty rewards, flight management, and operational tools.

The platform supports public airline information pages, customer registration and login, customer dashboards, profile and booking management, rewards tracking, staff user search, manager workflows for flights and rewards, and administrator workflows for account and data management.

## Project Features

- Customer registration, login, profile management, and dashboard access.
- Flight booking, booking history, and customer booking management.
- Loyalty rewards, tier information, partners, facilities, cabin, menu, and location pages.
- Staff user search and customer lookup tools.
- Manager flight management and reward configuration tools.
- Admin account management and system data management tools.
- Client-side storage utilities using IndexedDB and cookies.
- Server-side routing, controllers, EJS templates, and static asset handling.
- Automated backend and frontend tests with Jest.
- PDF report generation for test results.

## Technology Stack

- Node.js
- Express.js
- TypeScript
- EJS templates
- HTML
- CSS
- JavaScript
- IndexedDB
- Cookies
- jQuery
- Bootstrap
- Font Awesome
- Leaflet
- Swiper
- Jest

## Getting Started

Clone the repository and install dependencies:

```sh
npm install
```

Create a local `.env` file using the expected environment variables for the application. See `.env.example` if available in your local copy.

## Running the Project

Build the project:

```sh
npm run build
```

Start the application:

```sh
npm start
```

Run backend tests:

```sh
npm run test
```

Run frontend tests:

```sh
npm run test:client
```

Run all tests and generate test reports:

```sh
npm run test:all
```

When running locally, the application is typically available at:

```text
http://localhost:3000
```

## Contributing

Contributions should follow the project license and must preserve attribution to the original authors.

Before contributing:

- Review the project structure and existing coding patterns.
- Keep changes focused and relevant to the issue or feature being worked on.
- Test changes locally before submitting.
- Avoid committing secrets, credentials, local environment files, generated build output, or unrelated editor files.

## Reporting Issues & Bugs

Please report issues with clear reproduction steps and relevant context.

Helpful bug reports include:

- What happened.
- What you expected to happen.
- Steps to reproduce the issue.
- Screenshots or console output, if relevant.
- Browser, operating system, and environment details.
- Any related logs or error messages.

## Acknowledgments

This project is part of the CSIT214 IT Project Management course.

Special thanks to our team members and contributors.

## License

This project is licensed under the FlyDreamAir License Version 1.0 - May 2025.

See [LICENSE.md](https://github.com/gab706/FlyDreamAir/blob/main/LICENSE.md) for full details.
