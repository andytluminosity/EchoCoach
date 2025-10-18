# EchoCoach

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Backend

Note: Python 3.13 is required

Installation of virtual environment

```bash
python -m venv venv
```

```bash
source venv/bin/activate # Linux/Mac
venv\Scripts\activate.bat # Windows
```

Install dependencies
```bash
pip install -r requirements.txt
```

The backend is a Django application that provides the API for the frontend. It is located in the `backend` directory.

To run the backend, navigate to the `backend` directory and run:

```bash
python -m uvicorn echocoach.asgi:application --reload
```

Note: Make sure to switch the environment to venv before running the backend by running