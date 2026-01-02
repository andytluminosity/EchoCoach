import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Api } from '../api';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-record',
    imports: [FormsModule],
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

    recordingName = '';
    videoType = '';
    interviewQuestion = '';
    otherResponse = '';

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
        formData.append('name', this.recordingName);
        formData.append(
            'type',
            this.videoType == 'other' ? this.otherResponse : this.videoType
        );
        formData.append(
            'question',
            this.videoType == 'interview' ? this.interviewQuestion : ''
        );

        // Send for recording analysis
        this.api.sendRecording(formData).then((response) => {
            console.log('Recording analyzed');
            console.log('Analysis:', response);

            const resultData = new FormData();
            resultData.append('videoFile', videoBuffer);
            resultData.append('name', this.recordingName);
            resultData.append(
                'type',
                this.videoType == 'Other' ? this.otherResponse : this.videoType
            );
            resultData.append(
                'question',
                this.videoType == 'Interview' ? this.interviewQuestion : ''
            );

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
        const dialog = document.getElementById(
            'confirm_modal'
        ) as HTMLDialogElement;

        dialog.close();

        delete this.mediaRecorder;
    }
}
