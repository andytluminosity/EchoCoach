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

For development, ensure you have a postgres database running at localhost:5432 and run
```bash
python manage.py runserver
```

Create a .env.local and define the following:
```bash
DATABASE_URL=postgresql://postgres:SECRET_POSTGRES_PASSWORD@localhost:5432/echocoach
```
replacing SECRET_POSTGRES_PASSWORD with your superuser postgres password

To have a postgres database running at localhost:5432, install Jetbrains DataGrip: 
https://www.jetbrains.com/datagrip/download

- Click the menu (three horizontal lines on top of one another)
- Click Data Sources
- Click + and choose PostgreSQL
- Fill in your user and password (the user is typically postgres and the password is the one you set during postgres installation)
- Click test connection on the bottom. If everything works, it should return a good result
- Navigate the backend directory
- Verify that the connection works with 
```bash
python manage.py runserver
```
- Finally, run the following to set up the DB configurations locally
```bash
python manage.py makemigrations
python manage.py migrate
```
## Note: For development, everytime you run the backend, you must have DataGrip running

If you need to install Postgres:
https://www.enterprisedb.com/postgresql-tutorial-resources-training-1?uuid=867f9c7f-7be7-44ed-b03f-103a0a430d51&campaignId=postgres_rc_18
