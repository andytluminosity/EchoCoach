import { Component, computed, inject, signal, Signal } from '@angular/core';
// NgIf is deprecated but still used for conditional rendering
import { NgIf } from '@angular/common';
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
import { ActivatedRoute } from '@angular/router';
import { Api } from '../api';
import { Result } from '../customTypes/result';
import { firstValueFrom } from 'rxjs';

import { VjsPlayerComponent } from '../vjs-player-component/vjs-player-component';
import { environment } from '../environments/environment';

ModuleRegistry.registerModules([DonutSeriesModule, LegendModule]);

@Component({
    selector: 'app-feedback',
    standalone: true,
    imports: [AgCharts, VjsPlayerComponent, NgIf],
    templateUrl: './feedback.html',
    styleUrl: './feedback.css',
    providers: [Api],
})
export class Feedback {
    result: Result = {
        id: '',
        user: '',
        name: '',
        type: '',
        recording: '',
        facial_analysis_result: '',
        voice_analysis_result: '',
        transcribed_text: '',
        ai_feedback: '',
        favourited: false,
        deleted: false,
        length: 0,
        dateRecorded: '',
    };

    recordingName: string = 'untitled';
    transcribedText!: string;
    eyeScore: number = 0;
    parsedFacialAnalysis!: any;
    facialScores = signal([
        { Emotion: 'Anger', Score: 1 },
        { Emotion: 'Disgust', Score: 20 },
        { Emotion: 'Fear', Score: 3 },
        { Emotion: 'Happy', Score: 40 },
        { Emotion: 'Sad', Score: 6 },
        { Emotion: 'Surprise', Score: 4 },
        { Emotion: 'Neutral', Score: 3 },
    ]);
    dominantFacialEmotion!: string;
    parsedVoiceAnalysis!: any;
    voiceScores = signal([
        { Emotion: 'Neutral', Score: 0 },
        { Emotion: 'Happy', Score: 60 },
        { Emotion: 'Sad', Score: 20 },
        { Emotion: 'Angry', Score: 0 },
        { Emotion: 'Fear', Score: 10 },
        { Emotion: 'Disgust', Score: 10 },
        { Emotion: 'Surprise', Score: 0 },
    ]);
    dominantVoiceEmotion!: string;
    recordingSrc!: string;

    facialDonutChart = computed<AgChartOptions>(() => {
        const textColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-base-content')
            .trim();

        // depend on theme signal
        this.themeService.currentTheme();

        return {
            data: this.facialScores(),
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
            data: this.voiceScores(),
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

    private readonly MEDIA_ROOT = environment.baseUrl;

    constructor(private route: ActivatedRoute, private api: Api) {
        this.route.params.subscribe(async (params) => {
            try {
                const resultData = await firstValueFrom(
                    this.api.getSingleResult(params['result_id'])
                );
                console.log('resultData:', resultData);
                if (resultData && resultData.result) {
                    this.result = resultData.result as unknown as Result;
                }
                console.log('this.result:', this.result);
                this.recordingName = this.result.name;
                this.recordingSrc = this.MEDIA_ROOT + this.result.recording;
                console.log('recordingSrc:', this.recordingSrc);
                this.transcribedText = this.result.transcribed_text;

                this.parsedFacialAnalysis = this.result.facial_analysis_result
                    ? JSON.parse(this.result.facial_analysis_result)
                    : null;
                this.eyeScore = this.parsedFacialAnalysis[0];
                this.facialScores.set(
                    this.parsedFacialAnalysis && this.parsedFacialAnalysis[1]
                        ? [
                              {
                                  Emotion: 'Angry',
                                  Score: this.parsedFacialAnalysis[1][0],
                              },
                              {
                                  Emotion: 'Disgust',
                                  Score: this.parsedFacialAnalysis[1][1],
                              },
                              {
                                  Emotion: 'Fear',
                                  Score: this.parsedFacialAnalysis[1][2],
                              },
                              {
                                  Emotion: 'Happy',
                                  Score: this.parsedFacialAnalysis[1][3],
                              },
                              {
                                  Emotion: 'Sad',
                                  Score: this.parsedFacialAnalysis[1][4],
                              },
                              {
                                  Emotion: 'Surprise',
                                  Score: this.parsedFacialAnalysis[1][5],
                              },
                              {
                                  Emotion: 'Neutral',
                                  Score: this.parsedFacialAnalysis[1][6],
                              },
                          ]
                        : [
                              { Emotion: 'Angry', Score: 0 },
                              { Emotion: 'Disgust', Score: 0 },
                              { Emotion: 'Fear', Score: 0 },
                              { Emotion: 'Happy', Score: 0 },
                              { Emotion: 'Sad', Score: 0 },
                              { Emotion: 'Surprise', Score: 0 },
                              { Emotion: 'Neutral', Score: 0 },
                          ]
                );
                console.log('facialScores:', this.facialScores);

                this.dominantFacialEmotion = this.facialScores().reduce(
                    (prev, current) =>
                        prev.Score > current.Score ? prev : current
                ).Emotion;

                this.parsedVoiceAnalysis = this.result.voice_analysis_result
                    ? JSON.parse(this.result.voice_analysis_result)
                    : null;
                this.voiceScores.set(
                    this.parsedVoiceAnalysis
                        ? [
                              {
                                  Emotion: 'Neutral',
                                  Score: this.parsedVoiceAnalysis
                                      .confidence_scores.neutral,
                              },
                              {
                                  Emotion: 'Happy',
                                  Score: this.parsedVoiceAnalysis
                                      .confidence_scores.happy,
                              },
                              {
                                  Emotion: 'Sad',
                                  Score: this.parsedVoiceAnalysis
                                      .confidence_scores.sad,
                              },
                              {
                                  Emotion: 'Angry',
                                  Score: this.parsedVoiceAnalysis
                                      .confidence_scores.angry,
                              },
                              {
                                  Emotion: 'Fear',
                                  Score: this.parsedVoiceAnalysis
                                      .confidence_scores.fear,
                              },
                              {
                                  Emotion: 'Disgust',
                                  Score: this.parsedVoiceAnalysis
                                      .confidence_scores.disgust,
                              },
                              {
                                  Emotion: 'Surprise',
                                  Score: this.parsedVoiceAnalysis
                                      .confidence_scores.surprise,
                              },
                          ]
                        : [
                              { Emotion: 'Neutral', Score: 0 },
                              { Emotion: 'Happy', Score: 0 },
                              { Emotion: 'Sad', Score: 0 },
                              { Emotion: 'Angry', Score: 0 },
                              { Emotion: 'Fear', Score: 0 },
                              { Emotion: 'Disgust', Score: 0 },
                              { Emotion: 'Surprise', Score: 0 },
                          ]
                );
                console.log('voiceScores:', this.voiceScores);

                // Get directly from request and capitalize first letter of the emotion
                this.dominantVoiceEmotion = this.parsedVoiceAnalysis?.emotion
                    ? this.parsedVoiceAnalysis.emotion.charAt(0).toUpperCase() +
                      this.parsedVoiceAnalysis.emotion.slice(1)
                    : 'Neutral';

                console.log('Result from route:', this.result);
            } catch (error) {
                console.error('Error fetching result:', error);
            }
        });
    }

    themeService = inject(ThemeService);
}
