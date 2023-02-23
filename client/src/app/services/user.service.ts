import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    @Inject('API_URL') private apiUrl: string
  ) { }

  signUp(data: any) {
    const url = `${this.apiUrl}/signup`
    console.log(url);
    return this.http.post(url, data);
  }
}
