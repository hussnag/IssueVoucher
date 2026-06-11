import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Issuevoucher {
  baseUrl: string = environment.apiRootURL;
  token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImFkbWluIiwibmFtZWlkIjoiMiIsInJvbGUiOiJTdXBwZXJBZG1pbiIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiSG90ZWxJZCI6Ii0xIiwibmJmIjoxNzgwODMzNjcwLCJleHAiOjE3ODA5MjAwNzAsImlhdCI6MTc4MDgzMzY3MCwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MzQ0Ny8iLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjUzNDQ3LyJ9.1qH2QHkqFPJCUpw5lDZpZHX_gLOceVmMqW1-LqZ-wrg';

  headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });
  constructor(private http: HttpClient,) {}

  getIssueVoucher(): Observable<any> {
    return this.http.get(`${this.baseUrl}IssueVoucher/GetIssueVoucher`);
  }
 getItemDetailsById(id: any): Observable<any> {
    return this.http.get(`${this.baseUrl}master/item/GetAllItemMasterById/${id}`);
  }
  insertIssueVoucher(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}IssueVoucher/InsertIssueVoucher`,
      data,
    );
  }
  
  public GetJobDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl + 'Account/GetJobMasterDropdown', {
      headers: this.headers,
    });
  }
}
