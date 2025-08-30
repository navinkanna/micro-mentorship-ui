import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up-component',
  imports: [],
  templateUrl: './sign-up-component.html',
  styleUrl: './sign-up-component.scss'
})
export class SignUpComponent {
constructor(private router: Router){}

backToHome(){
  // Navigate back to home
  this.router.navigate(['/home']);
}
}
