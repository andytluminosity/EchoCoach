import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { User } from '../types/user';
import { v4 as uuidv4 } from 'uuid';
import { environment } from './environments/environment';

interface AnalyzeVoiceResponse {
    emotion: string;
    confidence_scores: {
        neutral: number;
        happy: number;
        sad: number;
        angry: number;
        fear: number;
        disgust: number;
        surprise: number;
    };
}

@Injectable({
    providedIn: 'root',
})
export class Api {
    baseurl = environment.baseUrl;
    httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    private http = inject(HttpClient);

    getTokenKey(): string | null {
        let token = localStorage.getItem('token');
        if (!token) {
            return null;
        }

        return JSON.parse(token).key;
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

    getCurrentUsername(): string {
        let token = localStorage.getItem('token');
        if (!token) {
            return 'Anonymous User';
        }

        return JSON.parse(token).user;
    }

    getUserData(): Observable<any> {
        return this.http.get(this.baseurl + '/user/', {
            headers: this.httpHeaders,
        });
    }

    async sendRecording(recording: FormData): Promise<any> {
        const facial_analysis_result = await firstValueFrom(
            this.http.post(this.baseurl + '/analyze-facial/', recording)
        );
        const voice_analysis_result = await firstValueFrom(
            this.http.post<AnalyzeVoiceResponse>(
                this.baseurl + '/analyze-voice/',
                recording
            )
        );

        const transcribed_text = await firstValueFrom(
            this.http.post<string>(this.baseurl + '/speech-to-text/', recording)
        );

        // TODO: Get API key from database
        const api_key = '';

        // const ai_feedback = await firstValueFrom(this.http.post(this.baseurl + '/ai-feedback/', {
        //     headers: this.httpHeaders,
        //     body: {
        //         "question": "Can you describe a time when you faced a difficult problem at work and how you solved it?",
        //         "text": transcribed_text,
        //         "emotion": voice_analysis_result.emotion,
        //         "api_key": api_key,
        //         "word_limit": 200
        //     }
        // }));

        return {
            facial_analysis_result,
            voice_analysis_result,
            transcribed_text,
            // ai_feedback
        };
    }

    saveRecording(recording: FormData): void {
        this.getUserData().subscribe((user) => {
            // Set or override ID
            !recording.has('id')
                ? recording.append('id', uuidv4())
                : recording.set('id', uuidv4());
            // Set or override user
            !recording.has('user')
                ? recording.append('user', user.username)
                : recording.set('user', user.username);

            this.http
                .post(this.baseurl + '/recordings/', recording)
                .subscribe((res) => {
                    console.log('Saved recording', res);
                });
        });
    }
}
