# EchoCoach

## Description

Ever wanted to practice your public speaking skills, but got tired of practicing in front of a mirror? EchoCoach is a web application which provides users a chance to practice their public speaking, interviewing, or presentation skills and recieve feedback from machine learning models. Uses Django for the backend, Angular + Tailwind for the frontend, and PyTorch for the LLMs!

## Features

### Record Yourself

Record yourself doing a mock interview, presenting a big speech, or just talking to the camera, using a responsive and intuitive video recorder.

<img width="1458" height="675" alt="image" src="https://github.com/user-attachments/assets/3110f942-2ff1-4b55-88aa-3fcf1b62ca1f" />

### Save your recording

After recording, you can then save your recording, including information like the recording name and type.

<img width="1458" height="675" alt="image" src="https://github.com/user-attachments/assets/01140ac8-be1c-4390-a997-9078886e8967" />

### Get feedback

Your recording will then be sent to be analyzed by our LLMs, which are all neural networks trained on various datasets and will analyze your recording for eye contact, facial emotions, and speech emotions. This information will then be displayed on our feedback page so you can see where to improve.

<img width="1448" height="628" alt="image" src="https://github.com/user-attachments/assets/937d8f5b-9db6-43d2-9109-d2da9c91fbc4" />

<img width="1451" height="720" alt="image" src="https://github.com/user-attachments/assets/fecc1bd6-b366-4c06-aca9-5ac5d67913e3" />



### View all your recordings and results

EchoCoach stores all your recording and results, so you can see any one at any time! Sort through your recording by name, date, etc., and also favourite, rename, or delete any recording.

<img width="1458" height="675" alt="image" src="https://github.com/user-attachments/assets/79c7c7c6-30f3-4051-9602-be4c8f6d5ca7" />



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

Install Postgres if you haven't already:
https://www.enterprisedb.com/postgresql-tutorial-resources-training-1?uuid=867f9c7f-7be7-44ed-b03f-103a0a430d51&campaignId=postgres_rc_18

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
- Under `General`
    - Enter `localhost` and `5432` for Host and Port respectively
    - Fill in your user and password (the user is typically postgres and the password is the one you set during postgres installation)
    - Enter `echocoach` for the Database
- Under `Schemas`
    - Ensure `echocoach` is ticked
- Click `Apply`
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



