import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Api } from '../api';

@Component({
    selector: 'app-results',
    imports: [CommonModule, RouterModule],
    templateUrl: './results.html',
    styleUrl: './results.css',
    providers: [Api],
})
export class Results {
    constructor(private api: Api) {}
    mockResults = [
        {
            name: 'Recording One',
            type: 'Interview',
            length: '3:02',
            dateRecorded: '10/1/25',
        },
        {
            name: 'Recording Two',
            type: 'Interview',
            length: '5:34',
            dateRecorded: '10/3/25',
        },
        {
            name: 'Recording Three',
            type: 'Interview',
            length: '4:12',
            dateRecorded: '10/5/25',
        },
    ];

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

    getResults = () => {
        let results = this.mockResults;
        switch (this.sortBy) {
            case 'nameAsc':
                results.sort((a, b) => this.stringCompare(a.name, b.name));
                break;
            case 'nameDsc':
                results.sort((a, b) => this.stringCompare(b.name, a.name));
                break;
            case 'lengthAsc':
                results.sort((a, b) => this.stringCompare(a.length, b.length));
                break;
            case 'lengthDsc':
                results.sort((a, b) => this.stringCompare(b.length, a.length));
                break;
            case 'dateAsc':
                results.sort((a, b) =>
                    this.stringCompare(a.dateRecorded, b.dateRecorded)
                );
                break;
            case 'dateDsc':
                results.sort((a, b) =>
                    this.stringCompare(b.dateRecorded, a.dateRecorded)
                );
                break;
        }
        return results;
    };
}
