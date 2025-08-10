import { Component, inject, Injectable } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Api } from './api';
import { Home } from './home/home';

@Component({
    selector: 'app-root',
    imports: [RouterModule, Home],
    templateUrl: './app.html',
    styleUrl: './app.css',
    providers: [Api],
})
export class App {
    protected title = 'EchoCoach';

    userData = 'Hello, Anonymous User';

    constructor(private api: Api) {
        this.getUserData();
    }

    getUserData = () => {
        this.api.getUserData().subscribe({
            next: (v) => (this.userData = 'Hello, ' + v.username),
            error: (e) => console.log(e),
        });
    };

    logout = () => {
        console.log('Logged out!');
        this.api.logout();
    };
}
