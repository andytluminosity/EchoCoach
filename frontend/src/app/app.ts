import { Component, inject, Injectable } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Api } from './api';
import { Home } from './home/home';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    imports: [RouterModule, Home, CommonModule],
    templateUrl: './app.html',
    styleUrl: './app.css',
    providers: [Api],
})
export class App {
    protected title = 'EchoCoach';

    isLoggedIn = false;

    constructor(private api: Api) {
        this.isLoggedIn = api.isLoggedIn();
    }

    logout = () => {
        console.log('Logged out!');
        this.api.logout();
        window.location.reload();
    };
}
