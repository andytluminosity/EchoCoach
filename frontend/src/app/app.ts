import { Component, inject, Injectable } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from './api'
import { Home } from './home/home';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Home],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [Api]
})

export class App {
  protected title = 'EchoCoach';
}
