import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../types/user';

@Injectable({
    providedIn: 'root',
})
export class Api {
    baseurl = 'http://127.0.0.1:8000';
    httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    private http = inject(HttpClient);

    getAllUsers(): Observable<any> {
        return this.http.get(this.baseurl + '/users/', {
            headers: this.httpHeaders,
        });
    }

    register(user: User): Observable<User> {
        return this.http.post<User>(this.baseurl + '/register/', user);
    }

    login(user: User): Observable<User> {
        return this.http.post<User>(this.baseurl + '/login/', user);
    }

    getUserData(): Observable<any> {
        return this.http.get(this.baseurl + '/user/', {
            headers: this.httpHeaders,
        });
    }
}
