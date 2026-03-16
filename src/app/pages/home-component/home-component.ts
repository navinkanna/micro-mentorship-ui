import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss'
})
export class HomeComponent {
  constructor(private router: Router){

  }

  signup(){
    this.router.navigate(['/signup']);
  }
  login(){
    this.router.navigate(['/login']);
  }
}
