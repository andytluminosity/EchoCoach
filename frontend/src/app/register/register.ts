import { Component } from '@angular/core';
import { Api } from '../api';
import { User } from '../../types/user';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Validate email from Stack Overflow
const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
};

@Component({
    selector: 'app-register',
    imports: [FormsModule, CommonModule],
    templateUrl: './register.html',
    styleUrl: './register.css',
    providers: [Api],
})
export class Register {
    constructor(private api: Api) {}

    passwordsMatch: boolean = false;
    validEmail: boolean = true;

    missingFields: {
        username: boolean;
        email: boolean;
        password: boolean;
        confirm_password: boolean;
    } = {
        username: false,
        email: false,
        password: false,
        confirm_password: false,
    };

    register = (f: NgForm) => {
        this.passwordsMatch = false;
        this.validEmail = true;

        this.missingFields = {
            username: !f.value.username,
            email: !f.value.email,
            password: !f.value.password,
            confirm_password: !f.value.confirm_password,
        };
        
        if (f.value.password !== f.value.confirm_password) {
            this.passwordsMatch = true;
            return;
        } 
        if (!validateEmail(f.value.email)) {
            this.validEmail = false;
            return;
        }

        // Ensure we do not send empty fields
        if (!f.value.username || !f.value.email || !f.value.password
            || !f.value.confirm_password) {
            return;
        }

        this.api.register(f.value).subscribe();
    };
}
