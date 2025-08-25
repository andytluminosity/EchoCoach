import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../types/user';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root',
})
export class Api {
    baseurl = 'http://127.0.0.1:8000';
    httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    private http = inject(HttpClient);

    getToken(): string | null {
        let token = localStorage.getItem('token');

        return token;
    }

    getAllUsers(): Observable<any> {
        return this.http.get(this.baseurl + '/users/', {
            headers: this.httpHeaders,
        });
    }

    register(user: User): Observable<User> {
        return this.http.post<User>(this.baseurl + '/register/', user);
    }

    login(user: User): Observable<string> {
        return this.http.post<string>(this.baseurl + '/login/', user);
    }

    logout(): void {
        localStorage.removeItem('token');
    }

    isLoggedIn(): boolean {
        return localStorage.getItem('token') != null;
    }

    getUserData(): Observable<any> {
        return this.http.get(this.baseurl + '/user/', {
            headers: this.httpHeaders,
        });
    }

    async sendRecording(recording: FormData): Promise<any> {
        const facial_analysis_result = await this.http.post(this.baseurl + '/analyze-facial/', recording, {
            headers: this.httpHeaders,
        });
        const voice_analysis_result = await this.http.post(this.baseurl + '/analyze-voice/', recording, {
            headers: this.httpHeaders,
        });
        return {facial_analysis_result, voice_analysis_result};
    }

    saveRecording(recording: FormData): void {
        this.getUserData().subscribe((user) => {
            // Set or override ID
            !recording.has('id') ? recording.append('id', uuidv4()) : recording.set('id', uuidv4());
            // Set or override user
            !recording.has('user') ? recording.append('user', user.username) : recording.set('user', user.username);
            
            this.http.post(this.baseurl + '/recordings/', recording).subscribe((res) => {
                console.log('Saved recording', res);
            });
        });
    }
}
