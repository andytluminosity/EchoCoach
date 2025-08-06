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

    userData = 'hi';

    constructor(private api: Api) {
        this.getUserData();
    }

    getUserData = () => {
        return 'hi';
        this.api.getUserData().subscribe({
            next: (v) => (this.userData = 'hi ' + v.results),
            error: (e) => console.log(e),
        });
    };
}
