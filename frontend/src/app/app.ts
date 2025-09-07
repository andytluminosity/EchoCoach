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

    constructor(private api: Api) {}

    logout = () => {
        console.log('Logged out!');
        this.api.logout();
    };
}
