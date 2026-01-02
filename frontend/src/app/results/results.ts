import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Api } from '../api';
import { firstValueFrom } from 'rxjs';
import { Result } from '../customTypes/result';

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
        this.results = await this.getResults()
        this.results = Array.isArray(this.results) ? this.results : [];
        console.log("Received results");
    }

    @Input() sortBy: string = 'nameAsc';

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

    toggleSort(field: 'name' | 'length' | 'date') {
        switch(field) {
            case 'name':
            this.sortBy = this.sortBy === 'nameDsc' ? 'nameAsc' : 'nameDsc';
            break;
            case 'length':
            this.sortBy = this.sortBy === 'lengthDsc' ? 'lengthAsc' : 'lengthDsc';
            break;
            case 'date':
            this.sortBy = this.sortBy === 'dateDsc' ? 'dateAsc' : 'dateDsc';
            break;
        }
        this.sortResults();
    }

    sortResults() {
        if (!this.results) return;

        switch(this.sortBy) {
            case 'nameAsc':
                this.results.sort((a: Result, b: Result) => a.name.localeCompare(b.name));
                break;
            case 'nameDsc':
                this.results.sort((a: Result, b: Result) => b.name.localeCompare(a.name));
                break;
            case 'lengthAsc':
                this.results.sort((a: Result, b: Result) => a.length - b.length);
                break;
            case 'lengthDsc':
                this.results.sort((a: Result, b: Result) => b.length - a.length);
                break;
            case 'dateAsc':
                this.results.sort((a: Result, b: Result) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime());
                break;
            case 'dateDsc':
                this.results.sort((a: Result, b: Result) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime());
                break;
        }
    }

    getResults = async (): Promise<Result[]> => {
        console.log("Getting results for user: " + this.api.getCurrentUsername());
        const userForm = new FormData();
        userForm.append('user', this.api.getCurrentUsername());

        const data = await firstValueFrom(this.api.getResults(userForm));
        return data.results;
    };
}
