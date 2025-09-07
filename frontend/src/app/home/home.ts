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
    userData = 'Anonymous User';

    constructor(private api: Api) {
        this.getUserData();
    }

    getUserData = () => {
        this.api.getUserData().subscribe({
            next: (v) => (this.userData = v.username),
            error: (e) => console.log(e),
        });
    };
}
