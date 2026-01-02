export interface Result {
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
    length: number;
    dateRecorded: string;
}