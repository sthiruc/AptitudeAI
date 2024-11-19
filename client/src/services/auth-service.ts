import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthModel } from "../models/auth-model";

@Injectable({providedIn:"root"})
export class AuthService {

    constructor(private http: HttpClient){}

    signupUser(email: string, username: string, password: string, role: string) {

        const authData: AuthModel = {email: email, username: username, password: password, role: role}
        this.http.post('http://localhost:3000/api/auth/signup', authData, {headers: { 'Content-Type': 'application/json'}})
            .subscribe(res => {
                console.log(res);
            },
            error => {
              console.error('Error:', error);
            });
    }
}