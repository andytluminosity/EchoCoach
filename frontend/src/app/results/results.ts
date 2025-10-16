import { Component } from '@angular/core';

@Component({
    selector: 'app-results',
    imports: [],
    templateUrl: './results.html',
    styleUrl: './results.css',
})
export class Results {
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
}
