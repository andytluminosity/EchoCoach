import { Component } from '@angular/core';
import { Api } from '../api';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    imports: [FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
    providers: [Api],
})
export class Login {
    constructor(private api: Api) {}

    login = (f: NgForm) => {
        this.api.login(f.value).subscribe();
    };
}
