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
    constructor(private api: Api) {
        this.getAllUsers();
    }

    login = (f: NgForm) => {
        this.api.login(f.value).subscribe((response) => {
            console.log(response);
        });
    };

    users = [{ username: 'Test' }];

    getAllUsers = () => {
        this.api.getAllUsers().subscribe({
            next: (v) => (this.users = v.results),
            error: (e) => console.log(e),
        });
    };
}
