import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Api } from '../api';
import { Router } from '@angular/router';

@Component({
    selector: 'app-record',
    imports: [],
    templateUrl: './record.html',
    styleUrl: './record.css',
    providers: [Api],
})
export class Record {
    @ViewChild('video', { static: true }) public video!: ElementRef;

    private router = inject(Router);

    stream?: MediaStream;
    mediaRecorder?: MediaRecorder;
    recording: Blob[] = [];
    downloadUrl = '';
    isLoading = false;

    constructor(private api: Api) {}

    ngOnInit() {
        const dialog = document.getElementById(
            'confirm_modal'
        ) as HTMLDialogElement;
        dialog.addEventListener('cancel', (event) => {
            this.deleteRecording();
        });
    }

    ngAfterViewInit() {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                this.video.nativeElement.srcObject = stream;
                this.video.nativeElement.play();
                this.stream = stream;
            });
    }

    startRecording() {
        this.recording = [];
        try {
            if (!this.stream) {
                throw new Error('Stream not connected');
            }
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'video/webm',
            });
            this.mediaRecorder.start();
            this.mediaRecorder.ondataavailable = (event: any) => {
                if (event.data && event.data.size > 0) {
                    this.recording.push(event.data);
                }
            };
        } catch (err) {
            console.log(err);
        }
    }

    stopRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
    }

    pauseRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.pause();
        }
    }

    saveRecording() {
        this.isLoading = true;
        const inputElement = document.getElementById(
            'recordingName'
        ) as HTMLInputElement;

        const recordingName = inputElement.value;

        const videoBuffer = new Blob(this.recording, {
            type: 'video/webm',
        });

        function getVideoDuration(blob: Blob): Promise<number> {
            return new Promise((resolve, reject) => {
                const blobUrl = URL.createObjectURL(blob);

                const video = document.createElement('video');

                video.onloadedmetadata = () => {
                    resolve(video.duration);
                    URL.revokeObjectURL(blobUrl); // Clean up the blob URL
                };

                video.onerror = () => {
                    URL.revokeObjectURL(blobUrl);
                    reject(new Error('Failed to load video metadata.'));
                };

                video.src = blobUrl;
            });
        }

        const formData = new FormData();
        formData.append('videoFile', videoBuffer);
        formData.append('name', recordingName);

        // Send for recording analysis
        this.api.sendRecording(formData).then((response) => {
            console.log('Recording analyzed');
            console.log('Analysis:', response);

            const resultData = new FormData();
            resultData.append('videoFile', videoBuffer);
            resultData.append('name', recordingName);

            Object.entries(response).forEach(([key, value]) => {
                resultData.set(key, JSON.stringify(value));
            });

            getVideoDuration(videoBuffer).then(
                (value: number) => {
                    const minutes = Math.floor(value / 60);
                    const seconds = String(Math.round(value % 60)).padStart(
                        2,
                        '0'
                    );
                    resultData.append('length', `${minutes}:${seconds}`);

                    this.api.saveResult(resultData);
                    console.log('Result saved');

                    this.router.navigate(['/results/feedback']);
                },
                (error) => {
                    console.log(error);
                }
            );
        });

        delete this.mediaRecorder;
    }

    deleteRecording() {
        const inputElement = document.getElementById(
            'recordingName'
        ) as HTMLInputElement;

        inputElement.value = '';

        delete this.mediaRecorder;
    }
}
