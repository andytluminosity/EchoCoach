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

interface AiFeedbackResponse {
    feedback: string;
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

        console.log("Facial analysis result:", facial_analysis_result);

        const voice_analysis_result = await firstValueFrom(
            this.http.post<AnalyzeVoiceResponse>(
                this.baseurl + '/analyze-voice/',
                recording
            )
        );

        console.log("Voice analysis result:", voice_analysis_result);

        const transcribed_text = await firstValueFrom(
            this.http.post<string>(this.baseurl + '/speech-to-text/', recording)
        );

        console.log("Transcribed text:", transcribed_text);
        
        const type = recording.get('type') as string;
        const question = recording.get('question') as string;

        console.log("Type:", type);
        console.log("Question:", question);

        // TODO: Get API key from database
        const api_key = '';
        let ai_feedback: AiFeedbackResponse | null = null;

        if (api_key) {
            ai_feedback = await firstValueFrom(this.http.post<AiFeedbackResponse>(this.baseurl + '/ai-feedback/', {
                headers: this.httpHeaders,
                body: {
                    "question": question,
                    "text": transcribed_text,
                    "facial_analysis": facial_analysis_result,
                    "voice_analysis": voice_analysis_result,
                    "video_type": type,
                    "api_key": api_key,
                    "word_limit": 200
                }
            }));
        }

        console.log("Facial analysis result:", facial_analysis_result);
        console.log("Voice analysis result:", voice_analysis_result);
        console.log("Transcribed text:", transcribed_text);

        return {
            facial_analysis_result,
            voice_analysis_result,
            transcribed_text,
            ai_feedback: ai_feedback?.feedback || ''
        };
    }

    saveResult(resultData: FormData): void {
        this.getUserData().subscribe((user) => {
            // Set or override user
            !resultData.has('user')
                ? resultData.append('user', user.username)
                : resultData.set('user', user.username);

            this.http
                .post(this.baseurl + '/results/', resultData)
                .subscribe((res) => {
                    console.log('Saved result', res);
                });
        });
    }
    
    getResults(request: FormData): Observable<any> {
        const user = request.get('user') as string;
        return this.http.get(this.baseurl + '/results/?user=' + encodeURIComponent(user));
    }

    getSingleResult(resultId: string): Observable<any> {
        return this.http.get(this.baseurl + '/results/single/?result_id=' + encodeURIComponent(resultId));
    }

    deleteResult(resultId: string): Observable<any> {
        return this.http.delete(this.baseurl + '/results/?result_id=' + encodeURIComponent(resultId));
    }

    renameResult(request: FormData): void {
        const data = new FormData();
        data.append('id', request.get('id') as string);
        data.append('newName', request.get('name') as string);
        
        this.http
            .post(this.baseurl + '/results/rename/', data)
            .subscribe((res) => {
                console.log('Renamed result', res);
            });
    }
    
    updateFavouriteResult(resultId: string, favourite: boolean): Observable<any> {
        return this.http.post(this.baseurl + '/results/', { result_id: resultId, favourited: favourite });
    }
}
