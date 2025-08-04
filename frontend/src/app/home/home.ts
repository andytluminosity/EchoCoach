import { Component } from '@angular/core';
import { Api } from '../api';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
  providers: [Api]
})
export class Home {

  users = [{username: 'Test'}]

  constructor(private api:Api) { 
    this.getAllUsers();
  }

  getAllUsers = () => {
    this.api.getAllUsers().subscribe(
      {
        next: (v) => this.users = v.results,
        error: (e) => console.log(e)
      }
    )
  }

}
