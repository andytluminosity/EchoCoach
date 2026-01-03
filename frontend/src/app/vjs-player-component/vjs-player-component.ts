import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import videojs from 'video.js';

interface VjsPlayerOptions {
  controls?: boolean;
  autoplay?: boolean;
  fluid?: boolean;
  aspectRatio?: string;
  sources?: { src: string; type: string }[];
}

@Component({
    selector: 'app-vjs-player',
    standalone: true,
    template: `
        <video #target class="video-js" controls muted playsinline preload="none"></video>
    `,
    styleUrls: ['./vjs-player-component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class VjsPlayerComponent implements OnInit, OnDestroy {
    @ViewChild('target', {static: true}) target!: ElementRef;

    // See options: https://videojs.com/guides/options
    @Input() options!: VjsPlayerOptions;

    player!: ReturnType<typeof videojs>;

    constructor(
        private elementRef: ElementRef,
    ) {}

    // Instantiate a Video.js player OnInit
    ngOnInit() {
        this.player = videojs(this.target.nativeElement, this.options, function onPlayerReady() {
        console.log('onPlayerReady', this);
        });
    }

    // Dispose the player OnDestroy
    ngOnDestroy() {
        if (this.player) {
            this.player.dispose();
        }
    }
}