import { Component, computed, inject } from '@angular/core';

import { AgCharts } from 'ag-charts-angular';
import {
    AgChartOptions,
    AgDonutSeriesOptions,
    DonutSeriesModule,
    LegendModule,
    ModuleRegistry,
    NumberFormatterParams,
} from 'ag-charts-community';
import { ThemeService } from '../themeService';

ModuleRegistry.registerModules([DonutSeriesModule, LegendModule]);

@Component({
    selector: 'app-feedback',
    imports: [AgCharts],
    templateUrl: './feedback.html',
    styleUrl: './feedback.css',
})
export class Feedback {
    themeService = inject(ThemeService);

    recordingName = 'Test_Recording';
    transcribedText =
        'This is a test recording. Real transcribed text comes from GPT analysis. This is a test recording. Real transcribed text comes from GPT analysis. This is a test recording. Real transcribed text comes from GPT analysis. This is a test recording. Real transcribed text comes from GPT analysis. This is a test recording. Real transcribed text comes from GPT analysis. This is a test recording. Real transcribed text comes from GPT analysis.';
    eyeScore = 0.6;
    facialScores = [
        { Emotion: 'Anger', Score: 1 },
        { Emotion: 'Disgust', Score: 20 },
        { Emotion: 'Fear', Score: 3 },
        { Emotion: 'Happy', Score: 40 },
        { Emotion: 'Sad', Score: 6 },
        { Emotion: 'Surprise', Score: 4 },
        { Emotion: 'Neutral', Score: 3 },
    ];
    dominantFacialEmotion = 'Happy';
    voiceScores = [
        { Emotion: 'Neutral', Score: 0 },
        { Emotion: 'Happy', Score: 60 },
        { Emotion: 'Sad', Score: 20 },
        { Emotion: 'Angry', Score: 0 },
        { Emotion: 'Fear', Score: 10 },
        { Emotion: 'Disgust', Score: 10 },
        { Emotion: 'Surprise', Score: 0 },
    ];
    dominantVoiceEmotion = 'Happy';
    recordingSrc = 'placeholderVideo.mp4';

    facialDonutChart = computed<AgChartOptions>(() => {
        const textColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-base-content')
            .trim();

        // depend on theme signal
        this.themeService.currentTheme();

        return {
            data: this.facialScores,
            title: {
                text: 'Facial Emotion Confidence Scores',
                color: textColor,
            },
            legend: {
                item: {
                    label: {
                        color: textColor,
                    },
                },
            },
            series: [
                {
                    type: 'donut',
                    calloutLabelKey: 'Emotion',
                    angleKey: 'Score',
                    calloutLabel: {
                        color: textColor,
                        fontSize: 12,
                    },
                } as AgDonutSeriesOptions,
            ],
            background: { visible: false },
        };
    });

    voiceDonutChart = computed<AgChartOptions>(() => {
        const textColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-base-content')
            .trim();

        // depend on theme signal
        this.themeService.currentTheme();

        return {
            data: this.voiceScores,
            title: {
                text: 'Voice Emotion Confidence Scores',
                color: textColor,
            },
            legend: {
                item: {
                    label: {
                        color: textColor,
                    },
                },
            },
            series: [
                {
                    type: 'donut',
                    calloutLabelKey: 'Emotion',
                    angleKey: 'Score',
                    calloutLabel: {
                        color: textColor,
                        fontSize: 12,
                    },
                } as AgDonutSeriesOptions,
            ],
            background: { visible: false },
        };
    });
}
