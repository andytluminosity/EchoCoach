import { Component, ElementRef, ViewChild } from '@angular/core';
import { Api } from '../api';

@Component({
    selector: 'app-record',
    imports: [],
    templateUrl: './record.html',
    styleUrl: './record.css',
    providers: [Api],
})
export class Record {
    @ViewChild('video', { static: true }) public video!: ElementRef;
    @ViewChild('recordedVideo', { static: true })
    public recordedVideo!: ElementRef;

    stream?: MediaStream;
    mediaRecorder?: MediaRecorder;
    recording: Blob[] = [];
    downloadUrl = '';

    constructor(private api: Api) {}

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
            this.mediaRecorder.onstop = (event: Event) => {
                const videoBuffer = new Blob(this.recording, {
                    type: 'video/webm',
                });
                this.downloadUrl = window.URL.createObjectURL(videoBuffer); // you can download with <a> tag
                this.recordedVideo.nativeElement.src = this.downloadUrl;

                const formData = new FormData();
                formData.append('videoFile', videoBuffer);

                this.api.saveRecording(formData);

                this.api.sendRecording(formData).subscribe((response) => {
                    console.log("Sending recording for analysis...")
                    console.log(response);
                });
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
}
