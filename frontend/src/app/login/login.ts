import { Component, inject } from '@angular/core';
import { Api } from '../api';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    imports: [FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
    providers: [Api],
})
export class Login {
    private router = inject(Router);

    constructor(private api: Api) {
        this.getAllUsers();
    }

    login = (f: NgForm) => {
        this.api.login(f.value).subscribe((response) => {
            const userDataString = JSON.stringify(response);
            localStorage.setItem('token', response);
            this.router.navigate(['']);
            window.location.reload();
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
