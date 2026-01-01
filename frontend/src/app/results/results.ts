import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Api } from '../api';
import { firstValueFrom } from 'rxjs';

interface Result {
    id: string;
    user: string;
    name: string;
    type: string;
    facial_analysis_result: string;
    voice_analysis_result: string;
    transcribed_text: string;
    ai_feedback: string;
    favourited: boolean;
    deleted: boolean;
    length: string;
    dateRecorded: string;
}

@Component({
    selector: 'app-results',
    imports: [CommonModule, RouterModule],
    templateUrl: './results.html',
    styleUrl: './results.css',
    providers: [Api],
})

export class Results {
    constructor(private api: Api) {}
    results: Result[] = [];

    async ngOnInit() {
        const data = await this.getResults()
        this.results = data.results;
        this.results = Array.isArray(this.results) ? this.results : [];
        console.log("Received results: ", this.results);
    }

    sortBy = 'nameAsc';

    stringCompare = (a: string, b: string) => {
        a = a.toUpperCase(); // ignore upper and lowercase
        b = b.toUpperCase(); // ignore upper and lowercase
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    };

    getResults = (): Promise<{results: Result[]}> => {
        console.log("Getting results for user: " + this.api.getCurrentUsername());
        const userForm = new FormData();
        userForm.append('user', this.api.getCurrentUsername());

        return firstValueFrom(this.api.getResults(userForm, this.sortBy));
    };
}
