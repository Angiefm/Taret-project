import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoomSearchService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/search';

  searchRooms(filters: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params = params.set(key, filters[key]);
    });

    return this.http.get<any>(`${this.baseUrl}/rooms`, { params });
  }
}
