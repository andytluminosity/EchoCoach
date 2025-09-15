import { Component } from '@angular/core';
import { Api } from '../api';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-home',
    imports: [RouterModule],
    templateUrl: './home.html',
    styleUrl: './home.css',
    providers: [Api],
})
export class Home {
    constructor(private api: Api) {}

    getUsername = () => {
        return this.api.getCurrentUsername();
    };
}
