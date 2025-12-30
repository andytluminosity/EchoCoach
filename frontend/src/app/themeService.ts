import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    public currentTheme = signal(
        JSON.parse(localStorage.getItem('theme') ?? JSON.stringify('light'))
    );

    setTheme(theme: string) {
        this.currentTheme.set(theme);
        localStorage.setItem('theme', JSON.stringify(theme));
    }
}
