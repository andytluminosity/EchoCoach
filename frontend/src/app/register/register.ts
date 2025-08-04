import { Component } from '@angular/core';
import { Api } from '../api';
import { User } from '../../types/user';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-register',
    imports: [FormsModule],
    templateUrl: './register.html',
    styleUrl: './register.css',
    providers: [Api],
})
export class Register {
    constructor(private api: Api) {}

    addUser = (f: NgForm) => {
        this.api.addUser(f.value).subscribe();
    };
}
